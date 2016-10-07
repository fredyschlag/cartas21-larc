var app = angular.module('app', ['ngRoute']);
 
app.config(function($routeProvider, $locationProvider)
{
   $routeProvider.when('/', {
      templateUrl : 'views/login.html',
      controller     : 'LoginCtrl',
   }).when('/home', {
      templateUrl : 'views/home.html',
      controller  : 'HomeCtrl',
   }).otherwise ({ 
      redirectTo: '/' 
   });

});