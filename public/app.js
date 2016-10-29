var app = angular.module('app', ['ngRoute', 'angularCSS']);
 
app.config(function($routeProvider, $locationProvider)
{
   $routeProvider.when('/', {
      templateUrl : 'views/login.html',
      controller     : 'LoginCtrl',
      css: ['https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css']
   }).when('/chat', {
      templateUrl : 'views/chat.html',
      controller  : 'ChatCtrl',    
      css: ['css/chatReset.css', 'css/chatStyle.css', 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css']
   }).otherwise ({ 
      redirectTo: '/' 
   });

});