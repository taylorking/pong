var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var hat = require('hat');
var pong = require('./pong');

server.listen(3000);

var rooms = {};
var lastRoom; 

var gameState = { 
  leftLocation:{},
  rightLocation:{}, 
  leftScore:0,
  rightScore:0,
  ballLocation:{},
  leftPlayerName:"",
  rightPlayerName:""
};
var leftInitial, rightInitial;
var currentRoom = {leftInitial: undefined, rightInitial:undefined};
io.on('connection', function(socket) {
  console.log("hello");
  userConnected(socket);
});
function userConnected(socket) { 
  console.log("connected");
  pong.onUpdate(function(data) {
    console.log(JSON.stringify(data));
    io.emit('battle_update', data);
  });
  socket.on('name_set', function(data) {
    socket.name = data;
    socket.emit('ready_and_alive');
  });
  socket.on('disconnect', function(data) {
    if(gameState.leftPlayerName === socket.player) {
      leftPlayerName = undefined;
    } else {
      rightPlayerName = undefined;
    }
  });
  socket.on('location', function(data) {
    if(socket.name === undefined) {
      return;
    }
    if(leftInitial === undefined) {
      leftInitial = data;
      gameState.leftLocation = data;
      gameState.leftPlayerName = socket.name;
      pong.registerPlayer(socket.name, {lat: data.lat, lng: data.lng});
      rightInitial = socket.name + 'r';
      pong.registerPlayer(socket.name + 'r', {lat: data.lat + .0004, lng:data.lng + .0003});
    }
    else if (rightInitial === undefined) {
      rightInitial = data;
      gameState.rightLocation = data;
      gameState.rightPlayerName = socket.name;
      console.log("right player" + socket.name);
      pong.registerPlayer(socket.name, {lat: data.lat, lng:data.lng});
    } else { 
      
      io.emit('battle_ready');
      console.log(data);
      pong.updatePlayer(socket.name, {lat: data.lat, lng:data.lng});
    }
  });
}



