var app = angular.module('app', ['ngRoute', 'angularCSS']);
 
app.config(function($routeProvider, $locationProvider)
{
   $routeProvider.when('/', {
      templateUrl : 'views/login.html',
      controller     : 'LoginCtrl',
      css: ['lib/bootstrap/dist/css/bootstrap.min.css']
   }).when('/chat', {
      templateUrl : 'views/chat.html',
      controller  : 'ChatCtrl',    
      css: ['css/chatReset.css', 'css/chatStyle.css', 'lib/font-awesome/css/font-awesome.min.css']
   }).otherwise ({ 
      redirectTo: '/' 
   });

});