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
});

function userConnected(socket) {
  console.log("connected");

  socket.virgin = true;

  pong.onUpdate(function (data) {
    io.emit('battle_update', data);
  });

  socket.on('name_set', function (data) {
    socket.name = data;
    sockets[data] = socket;
    socket.emit('ready_and_alive');
  });

  socket.on('disconnect', function (data) {
    Object.keys(sockets).forEach(function (key) {
      sockets[key].disconnect();
    });
    pong.reset();
    sockets = {};
  });

  socket.on('location', function (data) {
    if (!socket.name) return;

    if (socket.virgin) {
      pong.registerPlayer(socket.name, {
        lat: data.lat,
        lng: data.lng
      });
      socket.virgin = false;
    } else {
      pong.updatePlayer(socket.name, {
        lat: data.lat,
        lng: data.lng
      });
    }
  });
}
