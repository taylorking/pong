var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var hat = require('hat');
var pong = require('./pong');

var sockets = {};

server.listen(3000);

io.on('connection', function (socket) {
  console.log("hello");
  userConnected(socket);

  pong.onUpdate(function (data) {
    io.emit('battle_update', data);
  });
});

function userConnected(socket) {
  console.log("connected");

  socket.virgin = true;

  socket.on('name_set', function (data) {
    console.log('setting name', data);
    socket.name = data;
    sockets[data] = socket;
    socket.emit('ready_and_alive');
  });

  socket.on('disconnect', function (data) {
    Object.keys(sockets).forEach(function (key) {
      if (sockets[key]) {
        sockets[key].disconnect();
      }
    });
    pong.reset();
    sockets = {};
  });

  socket.on('location', function (data) {
    if (!socket.name) return;

    if (socket.virgin) {
      console.log('registering name', socket.name);
      console.log(data);
      pong.registerPlayer(socket.name, {
        lat: data.lat,
        lng: data.lng
      });

      socket.virgin = false;
    } else {
      console.log('updating player', socket.name);
      console.log(data);
      pong.updatePlayer(socket.name, {
        lat: data.lat,
        lng: data.lng
      });
    }
  });
}
