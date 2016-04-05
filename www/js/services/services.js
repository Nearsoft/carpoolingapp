angular.module('carpooling')

.factory('authService', function (clientId, $cordovaOauth) {

  return {
    login: login
  };

  function login() {

    return $cordovaOauth.google(clientId, ["email", "profile"]);
  };
})

.factory('profileAPIService', function ($http) {

  return {
    getProfile: getProfile
  };

  function getProfile(accessToken) {

    var url = 'https://www.googleapis.com/plus/v1/people/me?access_token='
    + accessToken;

    return $http.get(url)
    .then(function(response) {
      var data = response.data,
          imageUrl = data.image.url,
          user;

      imageUrl = imageUrl.split("?")[0];

      user = {
        id: data.id,
        name: data.displayName,
        email: data.emails[0].value,
        image: imageUrl + "?sz=40"
      };

      return user;
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

  function getRideInfo(user, eventId) {

    return $http.post(apiUrl + 'events/carbyuser', {
      event_id: eventId,
      user_id: user.id
    });
    //
    // return $http.post(apiUrl + 'events/carbyuser', {
    //   event_id: "5702b91582547a1100926167",
    //   user_id: "5702c17482547a110092616a"
    // });
    //

  }

  function getAll() {

    return $http.get(apiUrl + 'events');
  }
})

.factory('mapFactory', function($cordovaGeolocation) {
  var mapOptions = {
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map;
  var marker;
  var bounds = new google.maps.LatLngBounds();

  return {
    calculateDistance: calculateDistance,
    getGeolocation: getGeolocation
  };

  function calculateDistance(lat, lng) {
    var eventLatLng,
    distance,
    myLatLng;

    return getGeolocation().then(function(position) {

      myLatLng = new google.maps.LatLng(position.latitude,
      position.longitude);

      mapOptions.center = myLatLng;

      if(!map) {
        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        bounds.extend(myLatLng);

        marker = new google.maps.Marker({
            map: map,
            animation: google.maps.Animation.DROP,
            position: myLatLng
        });

        map.fitBounds(bounds);
        map.panToBounds(bounds);

        google.maps.event.trigger(map, 'resize');
      }
      else {
        marker.setVisible(false);

        marker = new google.maps.Marker({
          map: map,
          position: myLatLng
        });

        marker.setVisible(true);
      }

      eventLatLng = new google.maps.LatLng(lat, lng);
      distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLng, eventLatLng);

      return distance;
    });
  }

  function getGeolocation() {
    return $cordovaGeolocation.getCurrentPosition({
      timeout: 10000, enableHighAccuracy: true
    })
    .then(function(position) {

      return position.coords;
    });
  }
});
