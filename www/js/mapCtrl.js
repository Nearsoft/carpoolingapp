angular.module('carpooling')

.controller('mapCtrl', function($scope, $window, $state, $stateParams, $cordovaGeolocation, $cordovaLaunchNavigator, carpoolingData) {
  var options = { timeout: 10000, enableHighAccuracy: true };

  $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
    var currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: currentPosition,
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

      var infoWindow = new google.maps.InfoWindow({
        content: 'My position'
      });

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open($scope.map, marker);
      });
    });
  }, function(error) {
    console.log('Could not get geolocation');
  });
});
