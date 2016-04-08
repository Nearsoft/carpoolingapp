angular.module('carpooling')

.controller('chatCtrl', chatCtrl);

chatCtrl.$inject = [
  "$scope",
  "socketIo",
  "$stateParams",
  "eventsFactory",
  "$ionicScrollDelegate",
  "$interval",
  "$ionicModal",
  "mapFactory",
  "$ionicPlatform",
  "$state",
  "authService"
];

function chatCtrl($scope, socketIo, $stateParams, eventsFactory,
  $ionicScrollDelegate, $interval, $ionicModal, mapFactory,
  $ionicPlatform, $state, authService) {

    // $ionicPlatform.ready(function() {
    //
    //   $cordovaNativeAudio.preloadSimple('snare', 'audio/snare.mp3')
    //   .then(function(msg) { console.log(msg); })
  	// 				   .catch(function(error) { console.error(error); });
    //   $cordovaNativeAudio.preloadSimple('hi-hat', 'audio/highhat.mp3');
    //   $cordovaNativeAudio.preloadSimple('bass', 'audio/bass.mp3');
    //   $cordovaNativeAudio.preloadSimple('bongo', 'audio/bongo.mp3');
    // });

    $scope.messages = [];
    $scope.connected = false;
    $scope.attendees = [];

    $scope.sendMessage = sendMessage;
    $scope.updateTyping = updateTyping;

  	var socket = null,
    typing = false,
    user = $scope.currentUser,
    eventId = ($stateParams.eventId || ""),
    stop;

    initChat();

    function initChat() {

      eventsFactory.getRideInfo(user.id, eventId).then(function(res) {

        if(Object.keys(res.data).length > 0) {
          var ride = res.data;
          $scope.rideId = ride._id;
          socket = socketIo.init($scope, user, $scope.rideId);
          $scope.attendees = ride.passanger;
          // console.log($scope.attendees)
          $scope.connected = true;
        }
        else {
          alert("No events found");
          $state.go("app.events");
        }
      });
    }

    function updateMessages(e, msgs) {

       $scope.messages = msgs;
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

    $scope.play = function(sound) {
      $cordovaNativeAudio.play(sound);
    };
}
