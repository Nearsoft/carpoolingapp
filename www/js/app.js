angular.module('carpooling', [
  'ionic',
  'ngCordova',
  'ngCordovaOauth',
  'carpooling.directives',
  'ngSanitize',
  'btford.socket-io'
])

.constant("clientId", "764821343773-cjpf8lnubnnmjrupiu8oen4vsacgcq9n.apps.googleusercontent.com")
.constant("clientSecret", "5sAsJshpCHf_s4Tzk17_7nTK")
// .constant("serverUrl", "http://localhost:3000/")
// .constant("apiUrl", "http://localhost:3000/api/")
.constant("serverUrl", "http://nscarpooling.herokuapp.com/")
.constant("apiUrl", "http://nscarpooling.herokuapp.com/api/")

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/tabs.html',
    controller: 'appCtrl'
  })
  // ----  My events  ------------
  .state('app.myevents', {
      url: '/myevents',
      views: {
        'tab-myevents': {
          templateUrl: 'templates/myevents.html',
          controller: 'eventsCtrl'
        }
      }
  })
  .state('app.myevent', {
    url: '/myevent/:id',
    views: {
      'tab-myevents': {
        templateUrl: 'templates/event.html',
        controller: 'eventCtrl'
      }
    }
  })
  .state('app.rideMap', {
    url: '/rideMap/:eventId',
    views: {
      'tab-myevents': {
        templateUrl: 'templates/map.html',
        controller: 'rideCtrl'
      }
    }
  })
  .state('app.chat', {
    url: '/chat/:eventId',
    views: {
      'tab-myevents': {
        templateUrl: "templates/chat.html",
        controller: 'chatCtrl'
      }
    }
  })
  // ----- Events ---------
  .state('app.events', {
    url: '/events',
    views: {
      'tab-events': {
        templateUrl: 'templates/events.html',
        controller: 'eventsCtrl'
      }
    }
  })
  .state('app.event', {
    url: '/event/:id',
    views: {
      'tab-events': {
        templateUrl: 'templates/event.html',
        controller: 'eventCtrl'
      }
    }
  })

  // ----- Login ---------
  .state('app.login', {
    url: '/login',
    views: {
      'tab-myevents': {
        templateUrl: 'templates/auth.html'
      }
    }
  });

  $urlRouterProvider.otherwise('/app/myevents');
});
