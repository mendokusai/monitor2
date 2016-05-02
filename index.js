var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var path = require('path');
var RaspiCam = require("raspicam");
var port = process.argv[2] || 3000;

app.use('/client', express.static(__dirname + '/client'));
app.use('/stream', express.static(__dirname + '/stream'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

var sockets = {};
var counter = 0;

var camOpts = {
  // optional
  "w": "500",
  "h": "500",
  "e": "png",
  "tl": "500",
  "ex": "night"
};

var camera = new RaspiCam(
  "timelapse",
  __dirname + "/stream/photo%d.png",
  {camOpts}
);

http.listen(port, function(){
  console.log("You're tuned to port " + port);
});

io.on('connection', function(socket) {
  sockets[socket.id] = socket;
  console.log('Connected: ', Object.keys(sockets).length);
  io.emit('update_count', counter);
  socket.on('disconnect', function() {
    delete sockets[socket.id];
    if (Object.keys(sockets).length === 0) {
      console.log("shut it down.");
      counter = 0;
      console.log('counter reset: ', counter);
    } else {
      console.log('someone left.');
      console.log('Connected: ', Object.keys(sockets).length);
    }
  });

  socket.on('start_cam', function() {
    console.log('starting camera!');
    camera.start();
    // var arrayOfFiles = fs.readdir('./stream/', function(err, files) {
    //   if (err) throw err;
    //   files.forEach( function(file) {
    //     var url = "/stream/" + file;
    //     socket.emit('next_photo', url);
    //   });
    // });
  });

  socket.on('stop_cam', function() {
    camera.stop();
    console.log('staap!');
  });

  camera.on('read', function(err, timestamp, filename) {
    if (err) {
      console.log("Error! ", err);
      camera.stop();
    } else {
      console.log('sending photo!');
      socket.emit('next_photo', filename);
    }
  });

  camera.on('stop', function() {
    // clean out photos, but not directory
    rmDir('/stream', false);
  });

  // Counter and button checks
  socket.on('current_count', function() {
    console.log("We've got one, Larry!");
    console.log('Send em the counter:', counter);
    socket.emit('update_count', counter);
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

// Removes files from directory, removes directory too if exists
// Clean out stream folder after use.
rmDir = function(dirPath, removeSelf) {
  if (removeSelf === undefined) {
    removeSelf = true;
  }
  try {
    var files = fs.readdirSync(dirPath);
  }
  catch(err) {
    return;
  }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path.join(dirPath, files[i]);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
        rmDir(filePath);
      }
      if (removeSelf) {
        fs.rmdirSync(dirPath);
      }
    }
  }
  console.log("shit's gone, bro");
}
