var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var port = process.argv[2] || 3000;

app.use('/client', express.static(__dirname + '/client'));
app.use('/stream', express.static(__dirname + '/stream'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var sockets = {};
var counter = 0;

io.on('connection', function(socket) {
  sockets[socket.id] = socket;
  console.log('Connected: ', Object.keys(sockets).length);
  io.emit('update_count', counter);
  socket.on('disconnect', function() {
    delete sockets[socket.id];
    if (Object.keys(sockets).length === 0) {
      console.log("they're all gone.");
      counter = 0;
      console.log('counter reset: ', counter);
    } else {
      console.log('someone left.');
      console.log('Connected: ', Object.keys(sockets).length);
    }
  });

  socket.on('click', function(data) {
    console.log(data);
  });

  socket.on('count', function(data) {
    console.log('before: ', counter);
    counter ++;
    console.log('counter up one: ', counter);
    io.emit('update_count', counter);
  });
});

http.listen(port, function(){
  console.log("You're tuned to port " + port);
});