angular.module('carpooling')

.controller('eventsCtrl', function($scope, eventsFactory, $stateParams) {
  var handler = {
    success: function(res) {
      $scope.loaded = true;
      $scope.events = res.data && res.data.length > 0 ? res.data : null;
    },
    fail: function (error) {
      $scope.loaded = true;
      $scope.events = null;
    }
  }

  if($stateParams.hasOwnProperty("me")) {
    eventsFactory.getUserEvents($scope.currentUser.id)
    .then(handler.success, handler.fail);
  }
  else {
    eventsFactory.getAll()
    .then(handler.success, handler.fail);
  }

})

.controller('eventCtrl', function($scope, $stateParams, eventsFactory, mapFactory) {
  eventsFactory.getEvent($stateParams.id)
    .then(function(res) {
      $scope.event = res.data;
      var coords = new google.maps.LatLng(res.data.position)
      mapFactory.drawMap(coords).then(function(res) {
        $scope.map = res;
      });
    });
});
