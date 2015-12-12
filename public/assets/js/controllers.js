'use strict';

var mymosController = angular.module('mymosController', []);

mymosController.controller('MessagesCtrl', ['$scope', 'Messages',
  function($scope, Messages) {
    $scope.messages = Messages.query();
  }]);
