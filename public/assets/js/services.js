'use strict';

var mymosServices = angular.module('mymosServices', ['ngResource']);

mymosServices.factory('Message', ['$resource',
  function($resource) {
    return $resource('/assets/mData/:messageId.json', {}, {
      query: {method:'GET', params:{messageId:'messages'}, isArray:true}
    });
  }]);
