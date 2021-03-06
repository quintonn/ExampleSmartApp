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
    private $scope: ng.IScope,
    private $location: ng.ILocationService
  ) {}

  back(): void {
    window.location.href = `${window.location.protocol}//${window.location.host}/${window.location.pathname}`;
  }

  $onInit(): void {
    const self = this;

    setTimeout(() => {
      const readyCallback = function (smart: any) {
        self.onReady(self, smart);
      };

      FHIR.oauth2.ready(readyCallback, self.onError);
    }, 100);
  }

  loadPatientQueueMessage(self: QueueComponentController, smart: any): void {
    const url = `${appConstants.qmsURL}?patientId=${smart.patient.id}`;

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
    self.patientId = smart.server.serviceUrl + '/Patient/' + smart.patient.id;

    self.loadPatientQueueMessage(self, smart);

    // use the SMART FHIR client to load the patient details from the EHR
    smart.patient.read().then((pat: any) => {
      self.patientDetails = JSON.stringify(pat);

      for (let i = 0; i < pat.name.length; i++) {
        const name = pat.name[i];

        if (name.use == 'official') {
          self.patientName = name.given[0] + ' ' + name.family;
          break;
        }
      }

      for (let i = 0; i < pat.identifier.length; i++) {
        const id = pat.identifier[i];
        //if (id.use == 'usual')
        if (typeof id.type != 'undefined' && id.type != null) {
          let found = false;
          for (let j = 0; j < id.type.coding.length; j++) {
            if (id.type.coding[j].code == 'MR') {
              self.patientMRN = id.value;
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }

      self.$scope.$apply();
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
