angular.module('carpooling')

.controller('chatCtrl', chatCtrl);

function chatCtrl($scope, socketIo, $stateParams, eventsFactory,
  $ionicScrollDelegate, mapFactory, $state) {

    var socket,
    typing,
    user = $scope.currentUser,
    eventId = ($stateParams.eventId || "");

    $scope.messages = [];
    $scope.connected = false;
    $scope.attendees = [];

    $scope.sendMessage = sendMessage;
    $scope.updateTyping = updateTyping;
    $scope.eventId = eventId;


    (function initChat() {
      var ride;

      eventsFactory.getRideInfo(user.id, eventId).then(function(res) {
        if(Object.keys(res.data).length > 0) {
          $scope.connected = true;

          ride = res.data;
          $scope.rideId = ride._id;
          $scope.attendees = ride.passanger.length > 0 ? ride.passanger : null;

          socket = socketIo.initChat($scope, user, $scope.rideId);
          $ionicScrollDelegate.scrollBottom();
        }
        else {
          alert("You must be a driver or passanger to get access to the chatroom");
          $state.go("app.myEvents");
        }
      }, function(err) {
        alert(JSON.stringify(err));
      });
    })();

    function updateMessages(e, msgs) {
       $scope.messages = msgs;
       $ionicScrollDelegate.scrollBottom();
    }

  	//function called when user hits the send button
    function sendMessage() {
      if($scope.message !== undefined && $scope.message !== "") {
        socketIo.pushMessage(user.name, $scope.message, $scope.rideId)
        .then(function() {
          socket.emit('new message', $scope.message);
          socket.emit('stop typing');

          typing = false;
          $scope.message = "";
          $ionicScrollDelegate.scrollBottom();
        });
      }
  	}

  	//function called on Input Change
    function updateTyping() {
      if($scope.connected) {
        if (!typing) {
          typing = true;
          socket.emit('typing');
        }
        else if($scope.message === "") {
          typing = false;
          socket.emit('stop typing');
        }
      }
  	}

    $scope.$on('socket::addMessageToList', function (e, msgs) {
      updateMessages(e, msgs);
    });

    $scope.$on('socket::removeChatTyping', function (e, msgs) {
      updateMessages(e, msgs);
    });
}
