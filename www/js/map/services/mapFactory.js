angular.module('carpooling')

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
    clearMarkers();

    return getGeolocation().then(function(position) {
      if(showSelfLocation) {
        map = new google.maps.Map(document.getElementById("map"));

        setMarkers([{
          latitude: position.latitude,
          longitude: position.longitude
        }]);

        return map;
      }
      else {
        var latLng = new google.maps.LatLng(position.latitude, position.longitude);
        map = new google.maps.Map(document.getElementById("map"), {
          center: latLng
        });

        bounds.extend(latLng);
        map.fitBounds(bounds);
        map.panToBounds(bounds);

        return map;
      }
    }, function(err) {
      console.log(err);
    });
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
  function addMarker(latLng, markerIcon) {
    if(map) {
      var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: markerIcon ? markerIcon : "http://maps.google.com/mapfiles/kml/shapes/cabs.png"
      });

      markers.push(marker);

      bounds.extend(latLng);
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
      if(marker.location.latitude && marker.location.longitude) {
        addMarker(new google.maps.LatLng(marker.location.latitude,
          marker.location.longitude), marker.icon);
      }
    });
  }

  function calculateDistance(lat, lng) {
      // eventLatLng = new google.maps.LatLng(lat, lng);
      // distance = google.maps.geometry.spherical.computeDistanceBetween(myLatLng,
      // eventLatLng);
      //
      // return distance;
  }
});
