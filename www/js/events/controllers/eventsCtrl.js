angular.module('carpooling')

.controller('eventsCtrl', function($scope, eventsFactory, $stateParams) {
  if($stateParams.hasOwnProperty("me")) {
    eventsFactory.getUserEvents($scope.currentUser.id).then(function(res) {
      $scope.loaded = true;
      $scope.events = res.data && res.data.length > 0 ? res.data : null;
    }, function (error) {
      $scope.loaded = true;
      $scope.events = null;
    });
  }
  else {
    eventsFactory.getAll().then(function(res) {
      $scope.loaded = true;
      $scope.events = res.data && res.data.length > 0 ? res.data : null;
    }, function (error) {
      $scope.loaded = true;
      $scope.events = null;
    });
  }

});
