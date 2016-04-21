angular.module('carpooling')

.controller('appCtrl', appCtrl);

function appCtrl($scope, authFactory, $state, profileFactory,
  $ionicHistory) {

  $scope.isAuthenticated = false;
  $scope.login = login;
  $scope.logout = logout;

  function userFakeInit() {
     $scope.currentUser = {
       "id" : "56ec517977735d1100cee992",
       "provider_id" : "109768049405334972499",
       "provider" : "google",
       "name" : "Victor Castrejon",
       "photo" : "https://lh6.googleusercontent.com/-rWrQmSqGOEc/AAAAAAAAAAI/AAAAAAAAABw/ykztfZNaajY/photo.jpg?sz=50",
       "email" : "vcastrejon@nearsoft.com"
     };
     $scope.isAuthenticated = true;
   }

   //userInit();
   userFakeInit();

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
}
