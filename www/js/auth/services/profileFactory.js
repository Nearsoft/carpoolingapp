angular.module('carpooling')

.factory('profileFactory', function ($http, apiUrl) {

  return {
    getProfile: getProfile
  };

  function getProfile(accessToken) {

    var url = 'https://www.googleapis.com/plus/v1/people/me?access_token='
    + accessToken;

    return $http.get(url).then(function(response) {
      var googleInfo = response.data;

      if(googleInfo) {
        return getOrCreateUser(googleInfo);
      }
    },
    function(error) {
      return error;
    });
  }

  function getOrCreateUser(data) {
    var imageUrl,
    user;

    var createUser = $http.post(apiUrl + "users/create/", {
      profile: data
    });

    return createUser.then(function(res) {
      var userData = res.data;
      imageUrl = userData.photo ? userData.photo.split("?")[0] : "";

      user = {
        id: userData._id,
        name: userData.name,
        email: userData.email,
        image: imageUrl ?  imageUrl + "?sz=40" : ""
      };

      return user;

    }, function(err) {
      return err;
    });
  }
});
