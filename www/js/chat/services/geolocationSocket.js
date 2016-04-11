angular.module('carpooling')

.factory('geolocationSocket', function(socketFactory, serverUrl, mapFactory) {

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
        shareMyLocation(user, rideId);
      });
    }

    // On login display welcome message
    socket.on('my location shared', function (users) {
      connected = true;

      mapFactory.drawMap(true).then(function() {
        updateLocations(users);
      });
    });

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
      markers.push(user.location);
    });

    mapFactory.setMarkers(markers);
  }
});
