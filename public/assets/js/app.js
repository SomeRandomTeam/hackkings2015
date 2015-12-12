'use strict';

var mymosApp = angular.module('mymosApp', [
  'ngRoute',
  'mymosServices'
]);

mymosApp.controller('mymosController', function($scope, $http) {
    $http.get("http://www.w3schools.com/angular/customers.php")
    .then(function(response) {$scope.messages = response.data.records;});
});
