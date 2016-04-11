angular.module('carpooling')

.controller('chatCtrl', chatCtrl);

chatCtrl.$inject = [
  "$scope",
  "socketIo",
  "$stateParams",
  "eventsFactory",
  "$ionicScrollDelegate",
  "mapFactory",
  "$state"
];

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

    initChat();

    function initChat() {
      var ride;

      eventsFactory.getRideInfo(user.id, eventId).then(function(res) {
        if(Object.keys(res.data).length > 0) {
          $scope.connected = true;

          ride = res.data;
          $scope.rideId = ride._id;
          $scope.attendees = ride.passanger;

          socket = socketIo.initChat($scope, user, $scope.rideId);
          $ionicScrollDelegate.scrollBottom();
        }
        else {
          alert("No events found");
          $state.go("app.events");
        }
      });
    }

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

            // Updates the typing event
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
