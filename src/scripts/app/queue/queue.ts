import * as angular from 'angular';
import { appConstants } from '../../models/appConstants';

require('../../appConfig');

declare var cordova: any;
declare var FHIR: any;

class QueueComponentController implements ng.IOnInit {
  static $inject = ['$scope', '$location'];

  patientName: string = '';
  patientMRN: string = '';
  patientId: string = '';
  queueMessage: string = 'Loading status...';

  patientDetails: string = '';

  constructor(
    public $scope: ng.IScope,
    private $location: ng.ILocationService
  ) {}

  back(): void {
    window.location.href = `${window.location.protocol}//${window.location.host}/${window.location.pathname}`;
  }

  $onInit(): void {
    const self = this;

    console.log('on init xxx');

    console.log(self.$location);
    console.log(window.location.search);

    const readyCallback = function (smart: any) {
      console.log('inside readyCallback');
      self.onReady(self, smart);
    };

    FHIR.oauth2.ready(readyCallback, self.onError);
  }

  loadPatientQueueMessage(self: QueueComponentController, smart: any): void {
    const url = `https://18.222.191.253:29996/qms?patientId=${smart.patient.id}`;

    fetch(url).then((resp) => {
      if (!resp.ok) {
        self.queueMessage = 'Error: ' + resp.statusText;
        self.$scope.$apply();
      } else {
        resp.text().then((text) => {
          self.queueMessage = text;
          self.$scope.$apply();
        });
      }
    });
  }

  onReady(self: QueueComponentController, smart: any): void {
    console.log('onReady queue');
    console.log(smart);
    console.log('reading patient ' + smart.patient.id);

    self.patientId = smart.server.serviceUrl + '/Patient/' + smart.patient.id;

    self.loadPatientQueueMessage(self, smart);

    // use the SMART FHIR client to load the patient details from the EHR
    smart.patient.read().then((pat: any) => {
      self.patientDetails = JSON.stringify(pat);

      for (let i = 0; i < pat.name.length; i++) {
        const name = pat.name[i];
        if (name.use == 'official') {
          self.patientName = name.given + ' ' + name.family;
          self.$scope.$apply();
          break;
        }
      }

      console.log('looking for MR (usual) identifier');

      for (let i = 0; i < pat.identifier.length; i++) {
        const id = pat.identifier[i];
        //if (id.use == 'usual')
        if (typeof id.type != 'undefined' && id.type != null) {
          console.log('current usual identifier = ' + id.type.coding[0].code);
          if (id.type.coding[0].code == 'MR') {
            self.patientMRN = id.value;
            console.log('setting patient mrn = ' + self.patientMRN);
            self.$scope.$apply();
            break;
          }
        }
      }
    });
  }

  onError(err: any): void {
    console.log('onError');
    console.log(err);
  }
}

class QueueComponent implements ng.IComponentOptions {
  public controller: any;
  public template: string;

  constructor() {
    this.controller = QueueComponentController;
    this.template = require('./queue.html');
  }
}

angular.module(appConstants.appName).component('queue', new QueueComponent());
