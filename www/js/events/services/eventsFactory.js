angular.module('carpooling')

.factory('eventsFactory', function (apiUrl, $http) {

  return {
    getRideInfo: getRideInfo,
    getUserEvents: getUserEvents,
    getAll: getAll
  };

  function getRideInfo(userId, eventId) {
    return $http.post(apiUrl + 'events/carbyuser', {
      event_id: eventId,
      user_id: userId
    });
  }

  function getUserEvents(userId) {
    return $http.get(apiUrl + 'events/user/' + userId);
  }

  function getAll() {
    return $http.get(apiUrl + 'events');
  }
});
