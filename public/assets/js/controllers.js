'use strict';

var mymosController = angular.module('mymosController', []);

mymosController.controller('MessagesCtrl', ['$scope', 'Messages',
  function($scope, Messages) {
    $scope.messages = Messages.query();
  }]);

mymosController.controller('UserCtrl', ['$scope', 'Users',
  function($scope, Users) {
    $scope.users = Users.query();
  }]);
