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
  ) {
    console.log('queue ctor');
  }

  back(): void {
    window.location.href = `${window.location.protocol}//${window.location.host}/${window.location.pathname}`;
  }

  $onInit(): void {
    const self = this;

    setTimeout(() => {
      console.log('on init xxx');

      //console.log(self.$location);
      //console.log(window.location.search);

      const readyCallback = function (smart: any) {
        console.log('inside readyCallback');
        self.onReady(self, smart);
      };

      // function onReady(smart: any) {
      //   console.log('on ready');
      //   console.log(smart);
      // }

      // function onError() {
      //   console.log('Loading error', arguments);
      // }

      FHIR.oauth2.ready(readyCallback, self.onError);

      //FHIR.oauth2.ready(readyCallback, self.onError);
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
    console.log('onReady queue');
    console.log(smart);
    console.log('reading patient ' + smart.patient.id);

    self.patientId = smart.server.serviceUrl + '/Patient/' + smart.patient.id;

    self.loadPatientQueueMessage(self, smart);

    // use the SMART FHIR client to load the patient details from the EHR
    smart.patient.read().then((pat: any) => {
      self.patientDetails = JSON.stringify(pat);

      console.log(pat);
      console.log(JSON.stringify(pat));

      console.log('patient name length: ' + pat.name.length);
      for (let i = 0; i < pat.name.length; i++) {
        const name = pat.name[i];
        console.log(name);
        if (name.use == 'official') {
          self.patientName = name.given[0] + ' ' + name.family;
          break;
        }
      }

      console.log('looking for MR (usual) identifier');

      for (let i = 0; i < pat.identifier.length; i++) {
        const id = pat.identifier[i];
        //if (id.use == 'usual')
        if (typeof id.type != 'undefined' && id.type != null) {
          console.log('current usual identifier = ' + id.type.coding[0].code);
          let found = false;
          for (let j = 0; j < id.type.coding.length; j++) {
            if (id.type.coding[j].code == 'MR') {
              self.patientMRN = id.value;
              console.log('setting patient mrn = ' + self.patientMRN);
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
