//inclusions principales---------------------------
var fs = require('fs');

var express = require('express');
var app = express();

var server = require('http').Server(app);
//--------------------------------------------------

//Inclusion de socket.io
var io = require('socket.io')(server);

//Inclusion de MongoDB------------------------------

var MongoClient = require('mongodb').MongoClient;

var assert = require('assert');

var url = 'mongodb://localhost:27017/CESapp';

var ObjectID = require('mongodb').ObjectID;

//--------------------------------------------------

//App Usings

app.use('/public', express.static( __dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/views/index.html');
});

//--------------------------------------------------


//Gestion de socket.io------------------------------

io.on('connection', function(socket){
	console.log(socket);
});

//--------------------------------------------------

//Paramètrage du port du serveur , et de l'adresse MongoDB

var port = process.env.PORT || 3000;

server.listen(port, function(socket) {
	console.log('listening on :' + port);
});

var url = 'mongodb://localhost:27017/videodb';

//--------------------------------------------------