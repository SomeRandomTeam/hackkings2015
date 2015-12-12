'use strict';

var mymosApp = angular.module('mymosApp', [
  'ngRoute',
  'mymosServices'
]);

mymosApp.controller('MessageController', function($scope, $http) {
    $http.get("http://www.w3schools.com/angular/customers.php")
    .then(function(response) {$scope.messages = response.data.records;});
});

mymosApp.controller('UserController', function($scope, $http) {
    $http.get("http://www.w3schools.com/angular/customers.php")
    .then(function(response) {$scope.users = response.data.records;});
});

mymosApp.controller('ProfileController', function($scope, $http) {
    $http.get("/api/getmyself")
    .then(function(r) {
      return $http.get("/api/users/" + r._id);
    }).then(function(t) {
      $scope.$apply(function() {
        $scope.prof = t;
      })

    });

});
