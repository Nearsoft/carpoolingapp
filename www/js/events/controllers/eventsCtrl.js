angular.module('carpooling')

.controller('eventsCtrl', function($scope, eventsFactory) {
  
  eventsFactory.getAll()
  .then(function(res) {
    $scope.loaded = true;
    $scope.events = res.data;
  }, function (error) {
    alert(JSON.stringify(error));
  });
});
