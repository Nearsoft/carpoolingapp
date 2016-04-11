angular.module('carpooling')

.factory('authService', function (clientId, $cordovaOauth) {

  return {
    login: login
  };

  function login() {

    return $cordovaOauth.google(clientId, ["email", "profile"]);
  }
})

.factory('profileAPIService', function ($http, apiUrl) {

  return {
    getProfile: getProfile
  };

  function getProfile(accessToken) {

    var url = 'https://www.googleapis.com/plus/v1/people/me?access_token='
    + accessToken;

    return $http.get(url).then(function(response) {

      var data = response.data,
      imageUrl,
      user;

      if(data) {

        var createUser = $http.post(apiUrl + "users/create", {
          profile: data
        });

        return createUser.then(function(res) {

          var userData = res.data;

          imageUrl = userData.photo ? userData.photo.split("?")[0] : "";

          user = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            image: imageUrl ?  imageUrl + "?sz=40" : ""
          };

          return user;

        }, function(err) {
          return err;
        });
      }
    },
    function(error) {
      return error;
    });
  };

  return profileAPIService;
})

.factory('eventsFactory', function (apiUrl, $http) {

  return {
    getRideInfo: getRideInfo,
    getAll: getAll
  };

  function getRideInfo(userId, eventId) {

    return $http.post(apiUrl + 'events/carbyuser', {
      event_id: eventId,
      user_id: userId
    });
  }

  function getAll() {

    return $http.get(apiUrl + 'events');
  }
})

.factory('mapFactory', function($cordovaGeolocation) {
  var map,
  markers = [],
  bounds = new google.maps.LatLngBounds();

  return {
    drawMap: drawMap,
    calculateDistance: calculateDistance,
    getGeolocation: getGeolocation,
    addMarker: addMarker,
    setMarkers: setMarkers
  };

  function drawMap(showSelfLocation) {
    var showSelfLocation = showSelfLocation || true;

    clearMarkers();
    map = new google.maps.Map(document.getElementById("map"));

    if(showSelfLocation) {
      return getGeolocation().then(function(position) {
        setMarkers([{
          latitude: position.latitude,
          longitude: position.longitude
        }]);

        return map;

      }, function(err) {
        console.log(err);
      });
    }
    else {
      map.fitBounds(bounds);
      map.panToBounds(bounds);

      return map;
    }
  }

  function getGeolocation(latLngFormat) {
    var latLngFormat = latLngFormat || false;

    return $cordovaGeolocation.getCurrentPosition({
      timeout: 10000, enableHighAccuracy: true
    })
    .then(function(position) {
      var pos = position.coords;

      if(latLngFormat) {
        return new google.maps.LatLng(pos.latitude, pos.longitude);
      }
      else {
        return pos;
      }
    }, function(err) {

      return err;
    });
  }

  // Adds a marker to the map and push to the array.
  function addMarker(location) {
    if(map) {
      var marker = new google.maps.Marker({
        position: location,
        map: map
      });

      markers.push(marker);

      bounds.extend(location);
      map.fitBounds(bounds);
      map.panToBounds(bounds);
    }
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    markers = [];
  }

  function setMarkers(newMarkers) {

    clearMarkers();

    angular.forEach(newMarkers, function(marker) {
      addMarker(new google.maps.LatLng(marker.latitude,
        marker.longitude));
    });
  }

  function calculateDistance(lat, lng) {
    var eventLatLng,
    distance,
    myLatLng;

    return drawMap().then(function(map) {
      var marker = new google.maps.Marker({
          map: map,
          animation: google.maps.Animation.DROP,
          position: myLatLng
      });

      google.maps.event.trigger(map, 'resize');

      eventLatLng = new google.maps.LatLng(lat, lng);
      distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLng,
      eventLatLng);

      return distance;
    });
  }
});
