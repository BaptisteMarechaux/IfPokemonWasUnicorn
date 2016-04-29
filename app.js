var fs = require('fs');

var express = require('express');
var app = express();

var server = require('http').Server(app);

var io = require('socket.io')(server);

//MongoDB
var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

var url = 'mongodb://localhost:27017/CESapp';

var ObjectID = require('mongodb').ObjectID;

//App Usings

app.use('/public', express.static( __dirname + '/public'));

app.get('/', function(req, res) {
	res.relocate('/public/views/indeX.html');
});


io.on('connection', function(socket){

});

var port = process.env.PORT || 3000;

server.listen(port, function(socket) {
	console.log('listening on :' + port);
});

var url = 'mongodb://localhost:27017/videodb';