angular.module('carpooling')

.controller('appCtrl', appCtrl);

appCtrl.$inject = [
  "$scope", "authService", "$state", "profileAPIService",
  "$ionicHistory"
];

function appCtrl($scope, authService, $state, profileAPIService,
  $ionicHistory) {

  $scope.isAuthenticated = false;
  $scope.login = login;
  $scope.logout = logout;

  function login() {
    var state;

    authService.login().then(function (response) {
      if(response !== undefined && response.access_token !== undefined) {
        profileAPIService.getProfile(response.access_token).then(function(user) {

          if(user) {
            setCurrentUser(user);
            state = "app.events";
          }
          else {
            route = "app.login"
          }

          $ionicHistory.clearHistory();
          $state.go(state);
        },
        function(error) {
          alert(error);
        });
      }
    },
    function(error) {
      alert(error);
    });
  }

  function logout() {

    userInit();
    $state.go("app.login");
  };

  function userInit() {

    $scope.currentUser = null;
    $scope.isAuthenticated = false;
  }

  function setCurrentUser(user) {

    if(user !== undefined) {
      $scope.currentUser = user;
      $scope.isAuthenticated = true;
    }
  }

  function userFakeInit() {

    $scope.currentUser = {
      "id" : "56d8b59351cf7c9c0b720b79",
      "provider_id" : "117613786321394401804",
      "provider" : "google",
      "name" : "Rafa Manrique",
      "photo" : "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50",
      "email" : "rmanrique@nearsoft.com"
    };
    $scope.isAuthenticated = true;
  }

  //userInit();
  userFakeInit();

}
