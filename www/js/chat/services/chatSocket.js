angular.module('carpooling')

.factory('socketIo', function(socketFactory, $sanitize,
  serverUrl) {

  var $scope,
  connected = false,
  myIoSocket = io.connect(serverUrl),
  messages = [],
  COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  var myIoSocket = io.connect(serverUrl);

  try {
    io.connect(serverUrl)
  }
  catch(err) {
    alert(err);
  }

  return {
    init: init,
    addMessageToList: addMessageToList
  };

  function init(scope, user, rideId) {
    $scope = scope;

    var socket = socketFactory({
    	ioSocket: myIoSocket
  	});
    //
    // socket.on('connect', function() {
    //   console.log(user);
    //   connected = true;
    //   socket.emit('add user', {
    //     user: user,
    //     rideId: rideId
    //   });
    // });

    if(!connected) {
      socket.emit('add user', {
        user: user,
        rideId: rideId
      });
    }

    // On login display welcome message
    socket.on('login', function (users) {
      addMessageToList("", false, stringifyParticipants(users));
    });

    //On alreadyLoggedIn display alert message
    socket.on('already logged in', function () {
      alert("You have accessed in another device");
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

    // Whenever the server emits 'location shared', log the emiter's location
    socket.on('location shared', function (data) {
      console.log(data);
    });

    return socket;
  }

  // Display message by adding it to the message list
  function addMessageToList(username, style_type, message) {
    var color = style_type ? getUsernameColor(username) : null;

    username = $sanitize(username);
    removeChatTyping(username);

    messages.push({
      content: $sanitize(message),
      style: style_type,
      username: username,
      color:color
    });

    $scope.$emit('socket::addMessageToList', messages);
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
