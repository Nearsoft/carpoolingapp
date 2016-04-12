angular.module('carpooling')

.factory('authFactory', function (clientId, $cordovaOauth) {

  return {
    login: login
  };

  function login() {
    return $cordovaOauth.google(clientId, ["email", "profile"]);
  }
})
