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

    authService.login()
    .then(function (response) {
      if(response !== undefined && response.access_token !== undefined) {
        profileAPIService.getProfile(response.access_token)
        .then(function(user) {
            var state = "app.events";
            // if(UserService.existsOrSave(user)) {
            //   route = "app/events";
            // }
            // else {
            //   route = "app/login";
            // }

            setCurrentUser(user);
            $state.go(state);
            $ionicHistory.clearHistory();
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
      id: "214654643134567",
      name: "Foo",
      email: "foo@bar.com",
      image: "/img/bird.png"
    };
    $scope.isAuthenticated = true;
  }

  //userInit();
  userFakeInit();

}
