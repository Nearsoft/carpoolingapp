angular.module('carpooling')

.factory('geolocationSocket', function(socketFactory, serverUrl, mapFactory, $ionicPlatform) {

  var $scope,
  socket,
  connected = false;

  return {
    init: init,
    shareMyLocation: shareMyLocation
  };

  function init(user, rideId) {
    var newSocket;

    if(!connected) {
      try {
        newSocket = io.connect(serverUrl)
      }
      catch(err) {
        alert(err);
      }

      socket = socketFactory({
        ioSocket: newSocket
      });

      socket.on("connect", function() {
        connected = true;

        $ionicPlatform.ready(function() {
          mapFactory.drawMap().then(function() {
            shareMyLocation(user, rideId);
          }, function(err) {
            alert(err);
          });
        });
      });
    }

    // Every time a user shares her position
    socket.on('location updated', function (users) {
      updateLocations(users);
    });

    return socket;
  }

  function shareMyLocation(user, rideId) {
    connected = true;

    mapFactory.getGeolocation().then(function(position) {
      user.location = {
        latitude: position.latitude,
        longitude: position.longitude
      };

      socket.emit("share location", {
        user: user,
        rideId: rideId
      });
    }, function(err) {
      alert(err);
    });
  }

  function updateLocations(users) {
    var markers = [];

    angular.forEach(users, function(user) {
      markers.push({
        location: user.location,
        icon: user.photo
      });
    });

    mapFactory.setMarkers(markers);
  }
});
