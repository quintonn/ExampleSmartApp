import * as angular from 'angular';
import { appConstants } from '../../models/appConstants';

require('../../appConfig');

declare var cordova: any;
declare var FHIR: any;

class HomeComponentController implements ng.IOnInit {
  static $inject = ['$scope', '$location'];

  selectedHospital: any = null;

  hospitals: Array<any> = [];

  constructor(
    public $scope: ng.IScope,
    private $location: ng.ILocationService
  ) {
    console.log('home constructor');
    //console.log('path = ', $location.path());
    //console.log('search = ', $location.search());
  }

  $onInit(): void {
    console.log('on init');

    const self = this;

    // example patient (SmartHealth IT) -> 579423cd-3384-4e7d-bf19-295a26d27524

    if (
      window.location.href.indexOf('?code') > -1 ||
      window.location.href.indexOf('?state') > -1
    ) {
      console.log('onReady home **************************************');
      self.$location.path('/queue');

      // setTimeout(function () {
      //   console.log('calling oauth.ready');
      //   console.log(window.location);

      //   const onReadyCallback = function (x: any) {
      //     const s = self;
      //     console.log('calling self.onReady');
      //     console.log(s);
      //     self.onReady(s, x);
      //   };

      //   FHIR.oauth2.ready(onReadyCallback, self.onError);
      //   console.log('auth ready called XXX');
      // }, 100);
    } else {
      this.loadHospitals();
    }
  }

  loadHospitals(): void {
    const self: HomeComponentController = this;

    fetch(appConstants.facilitiesUrl).then((resp) => {
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
      resp.json().then((json) => {
        console.log(json);
        self.hospitals = json;
        self.$scope.$apply();
      });
    });
  }

  performLogin(): void {
    const self = this;

    const iss = this.selectedHospital.iss; //.iss;
    const clientId = this.selectedHospital.clientId;
    const scope = this.selectedHospital.scope;

    const launchUrl = `${appConstants.launchUrl}?clientId=${clientId}&iss=${iss}&scope=${scope}`;

    // check to see if this is running as a mobile app or web page
    if (typeof cordova != 'undefined' && cordova && cordova.InAppBrowser) {
      // this is when we are a mobile app
      const options =
        'clearcache=yes,clearsessioncache=yes,location=no,zoom=no';

      // Launch an in-app browser that essentially opens a new browser window as a pop-up.
      // The user won't really notice they have left the app, it will feel like it's the same app.
      const ref = cordova.InAppBrowser.open(launchUrl, '_blank', options);

      ref.addEventListener('error', (e: any) => {
        console.log('error: ', e);
      });

      // Listen when the browser URL changes and if we detect a URL with the word 'close' in it, we can close the pop-up browser
      // This is probably not the best solution but it's the only thing that seemed to work
      // OAuth advices deeplinks but we could not get it working for this demo
      ref.addEventListener('loadstop', function (a: any) {
        console.log('loadStop');
        console.log(a.url);
        if (a.url.indexOf('close') > -1) {
          var tmp = a.url.split('?')[1];
          console.log(tmp);

          console.log('---------------------------------------');
          var params = tmp.split('&');
          var code = '';
          var state = '';
          var sessionState = '';

          var query = '';
          for (var i = 0; i < params.length; i++) {
            var parts = params[i].split('=');
            var name = parts[0];
            var value = parts[1];
            console.log(name + ' = ' + value);
            if (name == 'code') {
              code = value;
            }
            if (name == 'state') {
              state = value;
            }
            if (name == 'sessionstate') {
              console.log('got session state');
              sessionState = value;
            }
            query = query + name + '=' + value + '&';
          }
          console.log('---------------------------------------');
          console.log(sessionState);
          console.log(atob(sessionState));

          sessionStorage[state] = atob(sessionState);

          ref.close();

          window.location.search = 'code=' + code + '&state=' + state;
        }
      });
    } else {
      window.location.href = launchUrl;
    }
  }

  onReady(self: HomeComponentController, smart: any): void {
    console.log('onReady home -----------------------------------');
    self.$location.path('/queue');
    self.$scope.$apply();
  }

  onError(err: any): void {
    console.log('onError');
    console.log(err);
  }
}

class HomeComponent implements ng.IComponentOptions {
  public controller: any;
  public template: string;

  constructor() {
    this.controller = HomeComponentController;
    this.template = require('./home.html');
  }
}

angular.module(appConstants.appName).component('home', new HomeComponent());
