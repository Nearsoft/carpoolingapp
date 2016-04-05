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
  "$cordovaNativeAudio"
];

function chatCtrl($scope, socketIo, $stateParams, eventsFactory,
  $ionicScrollDelegate, $interval, $ionicModal, mapFactory, $cordovaNativeAudio) {


      // $cordovaNativeAudio.preloadSimple('snare', 'audio/snare.mp3');
      // $cordovaNativeAudio.preloadSimple('hi-hat', 'audio/highhat.mp3');
      // $cordovaNativeAudio.preloadSimple('bass', 'audio/bass.mp3');
      // $cordovaNativeAudio.preloadSimple('bongo', 'audio/bongo.mp3');


    $scope.messages = [];
    $scope.connected = false;
    $scope.attendees = [];
    $scope.openModal = openModal;
    $scope.closeModal = closeModal;
    $scope.sendMessage = sendMessage;
    $scope.updateTyping = updateTyping;
    $scope.stopSharingLocation = stopSharingLocation;
    $scope.viewCarLocation = viewCarLocation;

  	var socket = null,
    typing = false,
    rideId,
    user = $scope.currentUser,
    eventId = ($stateParams.eventId || ""),
    stop,
    eventLat = "29.0907269",
    eventLng = "-111.0281571";

    eventsFactory.getRideInfo(user, eventId).then(function(res) {

      if(Object.keys(res.data).length > 0) {
        var ride = res.data;
        rideId = ride._id;
        socket = socketIo.init($scope, user, rideId);
        $scope.attendees = ride.passanger;
        // console.log($scope.attendees)
        $scope.connected = true;
      }
      // else {
      //   alert("No events found");
      // }
    }, function (error) {
      alert(error);
    });

    function openModal() {

      $scope.modal.show();
    }

    function closeModal() {

      $scope.modal.hide();
    }

    function updateMessages(e, msgs) {

       $scope.messages = msgs;
    }

  	//function called when user hits the send button
    function sendMessage() {

      if($scope.message !== undefined && $scope.message !== "") {
        socket.emit('new message', {
          message: $scope.message,
          rideId: rideId
        });

    		socketIo.addMessageToList(user.name, true, $scope.message);

        socket.emit('stop typing', rideId);
        typing = false;

        $scope.message = "";

        $ionicScrollDelegate.scrollBottom();
      }
  	}

  	//function called on Input Change
    function updateTyping() {

      if($scope.connected) {
        if (!typing) {
            typing = true;

            // Updates the typing event
            socket.emit('typing', rideId);
        }
        else if($scope.message === "") {
          typing = false;
          socket.emit('stop typing', rideId);
        }
      }
  	}

    function viewCarLocation() {

      $ionicModal.fromTemplateUrl('templates/mapModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.openModal();

        // calculateDistance();
        // stop = $interval(calculateDistance, 10000);
        //
        // function calculateDistance() {
        //   mapFactory.calculateDistance(eventLat,eventLng)
        //   .then(function(distance) {
        //     $scope.distance = distance;
        //   });
        // }

        shareMyLocation();
        stop = $interval(shareMyLocation, 10000);

        function shareMyLocation() {
          mapFactory.getGeolocation().then(function(location) {
            console.log(location);
            socket.emit('share location', location);
          });
        }
      });
    };

    function stopSharingLocation() {

      if (angular.isDefined(stop)) {
        $interval.cancel(stop);
        stop = undefined;
      }
    };

    $scope.$on('$destroy', function() {
      if($scope.modal) {
        $scope.modal.remove();
      }

      $scope.stopSharingLocation();
    });

    $scope.$on('modal.hidden', function() {

      $scope.stopSharingLocation();
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {

      $scope.stopSharingLocation();
    });

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
