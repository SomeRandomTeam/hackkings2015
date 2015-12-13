'use strict';

var mymosApp = angular.module('mymosApp', []);

mymosApp.controller('MessengerController', function($scope, $http) {
    // $http.get("http://www.w3schools.com/angular/customers.php")
    // .then(function(response) {$scope.messages = response.data.records;});
  $http.get("/api/getmyself")
  .then(function(me) {
    return me.data._id;
  }).then(function(myid) {
    return $http.get("/api/users/" + myid);
  }).then(function(userReq) {
    return userReq.data;
  }).then(function(user) {
    $scope.user = user;
    user.messages.forEach(function(msg) {
      $scope.decrypt(msg);
    });
  });

  $http.get("/api/users")
  .then(function(usersReq) {
    return usersReq.data;
  }).then(function(users) {
    $scope.users = users;
  });

  $scope.decrypt = function(msg) {
    var encryptedMessage = atob(msg.content);
    console.log(encryptedMessage);
    var key = localStorage.getItem('privateKey');
    var privateKey = openpgp.key.readArmored(key).keys[0];
    privateKey.decrypt('');
    var pgpMessage = openpgp.message.readArmored(encryptedMessage);
    openpgp.decryptMessage(privateKey, pgpMessage).then(function(plaintext) {
      $scope.$apply(function() {
        msg.content = plaintext;
      });
    }).catch(function(err) {
      console.log(err);
    });
  };

  $scope.getSide = function(message) {
    if(message.sender._id == $scope.user._id) {
      return "timeline-inverted";
    }
    return "";
  };

  $scope.toggleSelectState = function(friend) {
    friend.selected = !friend.selected;
  };

  $scope.sendMessage = function() {
    var message = {};
    message.sender = $scope.user._id;
    message.receivers = [];
    var keys = [];
    var ks = openpgp.key.readArmored($scope.user.publicKey).keys;
    for(var j = 0; j < ks.length; j++) {
      keys.push(ks[j]);
    }
    var friends = $scope.user.friends;
    for(var i = 0; i < friends.length; i++) {
      if(friends[i].selected) {
        message.receivers.push(friends[i]._id);
        var ks = openpgp.key.readArmored(friends[i].publicKey).keys;
        for(var j = 0; j < ks.length; j++) {
          keys.push(ks[j]);
        }
      }
    }
    var users = $scope.users;
    for(var i = 0; i < users.length; i++) {
      if(users[i].selected) {
        message.receivers.push(users[i]._id);
        var ks = openpgp.key.readArmored(users[i].publicKey).keys;
        for(var j = 0; j < ks.length; j++) {
          keys.push(ks[j]);
        }
      }
    }
    openpgp.encryptMessage(keys, $scope.message).then(function(pgpMessage) {
      message.content = btoa(pgpMessage);
      $http.post("/api/sendmessage", message);
      $scope.$apply(function() {
        $scope.message = "";
      });
    });
  };
});

