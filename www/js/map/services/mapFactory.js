angular.module('carpooling')

.factory('mapFactory', function($cordovaGeolocation, $filter) {
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

  function drawMap() {
    clearMarkers();

    return getGeolocation(true).then(function(position) {
      map = new google.maps.Map(document.getElementById("map"), {
        center: position
      });

      bounds.extend(position);
      map.fitBounds(bounds);
      map.panToBounds(bounds);

      return map;
    }, function(err) {
      return err;
    });
  }

  function getGeolocation(latLngFormat) {
    var latLngFormat = latLngFormat || false;

    return $cordovaGeolocation.getCurrentPosition({
      timeout: 10000, enableHighAccuracy: false
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
      return "Unable to get geolocation:" + err;
    });
  }

  // Adds a marker to the map and push to the array.
  function addMarker(latLng, markerIcon) {
    var markerOptions = {
      position: latLng,
      map: map
    };

    if(markerIcon) {
      markerOptions.icon = markerIcon;
    }

    if(map) {
      var marker = new google.maps.Marker(markerOptions);

      calculateDistance(latLng).then(function(distance) {
        createInfoWindow('Distance: ' + $filter("number")(distance / 1000, 2) + " km", marker);
      }, function() {
        createInfoWindow('Unable to compute distance', marker);
      });

      markers.push(marker);
      bounds.extend(latLng);
      map.fitBounds(bounds);
      map.panToBounds(bounds);
    }
  }

  function createInfoWindow(content, marker) {
    if(marker) {
      var infoWindow = new google.maps.InfoWindow({
        content: content
      });

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(map, marker);
      });
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
      if(marker.location && marker.location.latitude && marker.location.longitude) {
        addMarker(new google.maps.LatLng(marker.location.latitude,
          marker.location.longitude), marker.icon);
      }
    });
  }

  function calculateDistance(pointA) {
    return getGeolocation(true).then(function(pointB) {
      return google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB);
    });
  }
});
