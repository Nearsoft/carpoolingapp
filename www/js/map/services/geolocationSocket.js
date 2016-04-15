angular.module('carpooling')

.factory('geolocationSocket', function(socketFactory, serverUrl, mapFactory, $ionicPlatform) {

  var $scope,
  socket,
  socketUser,
  socketRideId,
  connected = false;

  return {
    init: init,
    shareMyLocation: shareMyLocation
  };

  function init(user, rideId) {
    socketUser = user;
    socketRideId = rideId;

    if(!connected) {
      openSocket();
    }
    else {
      initMap();
    }

    // Every time a user shares her position
    socket.on('location updated', function (users) {
      updateLocations(users);
    });

    return socket;
  }

  function openSocket() {
    var newSocket;

    try {
      newSocket = io.connect(serverUrl)
    }
    catch(err) {
      alert(err);
      return;
    }

    socket = socketFactory({
      ioSocket: newSocket
    });

    socket.on("connect", function() {
      connected = true;

      socket.emit("add user", {
        user: socketUser,
        rideId: socketRideId
      });

      initMap();
    });

    return socket;
  }

  function initMap() {
    $ionicPlatform.ready(function() {
      mapFactory.drawMap().then(function() {
        shareMyLocation();
      }, function(err) {
        alert(err);
      });
    });
  }

  function shareMyLocation() {
    if(!socket) return;

    connected = true;

    mapFactory.getGeolocation().then(function(position) {
      socketUser.location = {
        latitude: position.latitude,
        longitude: position.longitude
      };

      socket.emit("share location", {
        user: socketUser,
        rideId: socketRideId
      });
    }, function(err) {
      alert(err);
    });
  }

  function updateLocations(users) {
    var markers = [];
    
    angular.forEach(users, function(user) {
      if(user.location && user.location.latitude && user.location.longitude) {
        markers.push({
          location: user.location,
          icon: user.image
        });
      }
    });

    mapFactory.setMarkers(markers);
  }
});
