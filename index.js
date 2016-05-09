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
app.use(express.static(__dirname + '/stream'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/stream/*', function(req, res) {
  var img_src = req.url;
  res.sendFile(path.resolve(path.resolve(__dirname, img_src)));
});

var sockets = {};

var camOpts = {
  // must haves
  "mode": "timelapse",
  "output": __dirname + "/stream/photo%0d.png",
  // optional
  "w": "500",
  "h": "500",
  "e": "png",
  "tl": "1000",
  "ex": "night"
};

var camera = new RaspiCam(camOpts);

http.listen(port, function(){
  console.log("You're tuned to port " + port);
});

io.on('connection', function(socket) {
  sockets[socket.id] = socket;
  console.log('Connected: ', Object.keys(sockets).length);
  socket.on('disconnect', function() {
    delete sockets[socket.id];
    if (Object.keys(sockets).length === 0) {
      console.log("shut it down.");
    } else {
      console.log('someone left.');
      console.log('Connected: ', Object.keys(sockets).length);
    }
  });

  socket.on('start_cam', function() {
    console.log('starting camera!');
    camera.start();
  });

  socket.on('error', function(e){
    console.log("Borken socket: ", e);
  });

  socket.on('stop_cam', function() {
    camera.stop();
    console.log('staap!');
  });

  camera.on('read', function(err, timestamp, filename) {
    if (err) {
      console.log("Critical error! ", err);
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

  camera.on('exit', function() {
    console.log("PING! Done!");
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
