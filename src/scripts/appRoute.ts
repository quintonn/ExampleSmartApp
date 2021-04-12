import * as angular from 'angular';
import { appConstants } from './models/appConstants';

require("./appConfig");

angular.module(appConstants.appName).config(['$locationProvider', '$routeProvider', '$sceDelegateProvider', function ($locationProvider: ng.ILocationProvider, $routeProvider: ng.route.IRouteProvider, $sceDelegateProvider: any)
{
    //$locationProvider.html5Mode(false);

    $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        '**']);

    $routeProvider.when("/:path?",
        {
            //reloadOnUrl: false,
            //reloadOnSearch: false,
            template: function ($routeParams: ng.route.IRouteParamsService)
            {
                var item = $routeParams.path;
                
                console.log(item);
                
                if (item == null || item.length == 0)
                {
                    item = "home";
                }

                return "<" + item + "></" + item + ">";
            },
            resolve:
            {
                xx: ['$location', function ($location: ng.ILocationService)
                {
                    var path = $location.path();
                }]
            }
        });
}]);