angular.module('carpooling')

.factory('socketIo', function(socketFactory, $sanitize, serverUrl,
  $sce, $http, apiUrl, $filter, mapFactory) {

  var $scope,
  connected = false,
  socket,
  messages = [],
  users = [],
  COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  return {
    initChat: initChat,
    pushMessage: pushMessage
  };

  function initChat(scope, user, rideId) {
    var newSocket;
    $scope = scope;

    if(!connected) {
      try {
        newSocket = io.connect(serverUrl)
      }
      catch(err) {
        alert(err);
      }

      socket = socketFactory({
        ioSocket: newSocket
      });

      socket.on("connect", function() {
        connected = true;

        socket.emit("add user", {
          user: user,
          rideId: rideId
        });
      });
    }
    else {
      addMessageToList("", false, stringifyParticipants(users));
    }

    getMessages(rideId).then(function(res) {
      if(res && res.data) {
        angular.forEach(res.data, function(msg) {
          addMessageToList(msg.username, true, msg.content, msg.created_at);
        });
      }
    });

    // On login display welcome message
    socket.on('login', function (usrs) {
      connected = true;
      users = usrs;
      addMessageToList("", false, stringifyParticipants(users));
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      if(data.message && data.username) {
        addMessageToList(data.username, true, data.message);
      }
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      addMessageToList("", false, data.username + " joined");
      addMessageToList("", false, stringifyParticipants(data.users));
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      addMessageToList("", false, data.username + " left");
      addMessageToList("", false, stringifyParticipants(data.users));
    });

    //Whenever the server emits 'typing', show the typing message
    socket.on('typing', function (data) {
      addChatTyping(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', function (data) {
      removeChatTyping(data.username);
    });

    return socket;
  }

  function addToConversation(u, rideId) {
    mapFactory.getGeolocation().then(function(position) {
      u.location = {
        lat: position.latitude,
        lng: position.longitude
      };

      socket.emit('add user', {
        user: u,
        rideId: rideId
      });
    });
  }

  // Display message by adding it to the message list
  function addMessageToList(username, isMessage, message, time) {
    var color = isMessage ? getUsernameColor(username) : null,
    time = isMessage ? $filter("date")(new Date(), "yyyy-MM-dd HH:mm:ss") : "",
    message = {
      content: $sanitize($sce.trustAsHtml(message)),
      style: isMessage,
      username: username,
      color:color,
      time: time
    };

    username = $sanitize(username);
    removeChatTyping(username);

    messages.push(message);
    $scope.$emit('socket::addMessageToList', messages);
  }

  function pushMessage(username, msg, rideId) {

    addMessageToList(username, true, msg);

    return $http.post(apiUrl + "chat/addMessage", {
      message: {
        content: msg,
        username: username
      },
      rideId: rideId
    });
  }

  function getMessages(rideId) {
    messages = [];
    return $http.get(apiUrl + "chat/messages/" + rideId);
  }

  // Removes the visual chat typing message
  function removeChatTyping (username) {
    // console.log(messages);
    messages = messages.filter(function(element) {
      return element.username != username || element.content != " is typing"
    });

    $scope.$emit('socket::removeChatTyping', messages);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    addMessageToList(data.username, true, " is typing");
  }

  //Generate color for the same user.
  function getUsernameColor (username) {
    var hash = 7,
        index;

    // Compute hash code
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Return message string depending on the number of users
  function stringifyParticipants(users)
  {
    var strParticipants,
        numUsers = users.length,
        names = [];

    if(numUsers === 1) {
      strParticipants = "Nobody else is in this conversation";
    }
    else if(numUsers > 1) {
      for(var i = 0; i < users.length; i++) {
        names.push(users[i].name);
      }

      strParticipants = numUsers + " participants in this conversation: " +
        names.join(", ");
    }

    return strParticipants;
  }
});
