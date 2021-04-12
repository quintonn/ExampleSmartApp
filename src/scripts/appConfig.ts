import * as angular from 'angular';
import * as ngRoute from 'angular-route';
import * as svg4everyone from 'svg4everybody';

import "./../css/main.css";
import "./../css/tailwind.css";
import { appConstants } from './models/appConstants';

angular.module(appConstants.appName, [ngRoute]);

setTimeout(function ()
{
    let w: any = window;
    w.handleOpenURL = function(url: any) {
        console.log(">>>>>>>>>>>>>>>>>>>");
        console.log(url);
      };

    svg4everyone.default();

    var div = document.getElementById('mainApp');

    angular.bootstrap(div, [appConstants.appName], { strictDi: true });

}, 100);