angular.module('carpooling')

.factory('eventsFactory', function (apiUrl, $http) {

  return {
    getRideInfo: getRideInfo,
    getUserEvents: getUserEvents,
    getAll: getAll,
    getEvent: getEvent
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
    return $http.get(apiUrl + 'events/past'); // for testing only pls remove /past for production
  }

  function getEvent(id) {
    return $http.get(apiUrl + 'events/' + id);
  }
});
