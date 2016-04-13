angular.module('carpooling')

.controller('appCtrl', appCtrl);

function appCtrl($scope, authFactory, $state, profileFactory,
  $ionicHistory) {

  $scope.isAuthenticated = false;
  $scope.login = login;
  $scope.logout = logout;

  userInit();

  function userInit() {
    $scope.currentUser = null;
    $scope.isAuthenticated = false;
  }

  function login() {
    var state;

    authFactory.login().then(function (response) {
      if(response !== undefined && response.access_token !== undefined) {
        getProfile(response.access_token);
      }
    },
    function(error) {
      alert(error);
    });
  }

  function getProfile(access_token) {
    profileFactory.getProfile(access_token).then(function(user) {
      if(user) {
        setCurrentUser(user);
        state = "app.myEvents";
      }
      else {
        route = "app.login"
      }

      // $ionicHistory.clearHistory();
      $state.go(state);
    },
    function(error) {
      alert(error);
    });
  }

  function logout() {
    userInit();
    $state.go("app.login");
  }

  function setCurrentUser(user) {
    if(user !== undefined) {
      $scope.currentUser = user;
      $scope.isAuthenticated = true;
    }
  }

  function userFakeInit() {
    $scope.currentUser = {
      "id" : "5702b8d582547a1100926166",
      "provider_id" : "117613786321394401804",
      "provider" : "google",
      "name" : "Rafa Manrique",
      "photo" : "https://lh6.googleusercontent.com/-F2d48-tFicc/AAAAAAAAAAI/AAAAAAAAAAo/-j7vbigZIB8/photo.jpg?sz=50",
      "email" : "rmanrique@nearsoft.com"
    };
    $scope.isAuthenticated = true;
  }
  
//   userFakeInit();
}
