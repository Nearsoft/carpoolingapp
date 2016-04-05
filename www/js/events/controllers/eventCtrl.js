angular.module('carpooling')

.controller('eventCtrl', function($scope, $window, $state, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator, carpoolingData) {
  // var locationId = parseInt($stateParams.id) - 1;
  carpoolingData.forEach(function(event) {
    if (event._id === $stateParams.id) {
      $scope.event = event;
    };
  });

  var location = new google.maps.LatLng($scope.event.location[1], $scope.event.location[0]);

  var options = { timeout: 10000, enableHighAccuracy: true };

  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: location,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);


    google.maps.event.addListenerOnce($scope.map, 'idle', function() {
      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: currentPosition
      });

      var destinationMarker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: location
      });


      var infoWindow = new google.maps.InfoWindow({
        content: 'Coordinates: ' + currentPosition.lat() + ' ' + currentPosition.lng()
      });

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open($scope.map, marker);
      });
    });

    //Get directions
    $scope.getRoute = function() {
      var directionsService = new google.maps.DirectionsService(),
        directions = new google.maps.DirectionsRenderer();

      directions.setMap($scope.map);

      var directionsData = {
        origin: currentPosition,
        destination: location,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }

      directionsService.route(directionsData, function(res, status) {
        var route = res.routes[0];
        var leg = route.legs[0];

        directions.setDirections(res);

        $scope.route = {
          distance: leg.distance,
          duration: leg.duration
        }
      });
    }

    //Navigation help
    $scope.navigate = function() {
      if($window.cordova) {
        $cordovaLaunchNavigator.navigate(destination, currentPosition);
      } else {
        var urlScheme = "http://maps.google.com/maps?&saddr=" + currentPosition.lat() + "," + currentPosition.lng() + "&daddr=" + location.lat() + "," + location.lng();
        $window.open(urlScheme);
      }
    };

  }, function(error) {
    console.log('Could not get geolocation');
  });

  //var watchOptions = {
  //  frequency: 1000,
  //  timeout: 3000,
  //  enableHighAccuracy: false
  //};
  //
  //var watch = $cordovaGeolocation.watchPosition(watchOptions);
  //
  //watch.then(function(position) {
  //  var lat = position.coords.latitude,
  //      lng = position.coords.longitude,
  //      currentLocation = new google.maps.LatLng(lat, lng);
  //
  //      currentPosMarker.setPosition(currentLocation);
  //}, function(error) {
  //  alert('Geoposition error');
  //});

});
