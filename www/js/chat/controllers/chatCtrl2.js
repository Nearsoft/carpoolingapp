angular.module('carpooling')

.controller('chatCtrl2', function($scope, $stateParams, socketIo,
  eventsFactory) {

  var socket = null,
  typing = false,
  rideId,
  user = $scope.currentUser,
  eventId = ($stateParams.eventId || ""),
  stop,
  eventLat = "29.0907269",
  eventLng = "-111.0281571";

  eventsFactory.getRideInfo(user, eventId)
  .then(function(res) {
    if(Object.keys(res.data).length) {
      var ride = res.data;
      rideId = ride._id;
      socket = socketIo.init($scope, user, rideId);

      $scope.attendees = ride.passanger;
      // console.log($scope.attendees)
      $scope.connected = true;
    }
  });
});
