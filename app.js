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

var url = 'mongodb://localhost:27017/Unicorn';

var ObjectID = require('mongodb').ObjectID;

//--------------------------------------------------

//App Usings

app.use('/public', express.static( __dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/views/index.html');
});

//--------------------------------------------------

//Variable de gestion d'utilisateurs----------------

var players = [];

var currentConnections = {};
var currentID = [];

//--------------------------------------------------

//Gestion de socket.io------------------------------

io.on('connection', function(socket){
	console.log('a user connected : ' + socket.id);
	currentConnections[socket.id] = {socket: socket};
	currentID.push(socket.id);

	socket.on('attack', function (){
		socket.emit('attackDone', {attributExemple : 'truc'})
	});
	
	socket.on('useMove', function(msg){
		console.log('message: ' + msg);
	});
	
	socket.on('connectUser', function(msg){
		player = {
			pseudo : msg.pseudo,
			password : msg.password,
			state : 0,
			elo : 1200,
		};
		var exist = false;
		for(i = 0; i < players.length; i++) {
			if(players[i].pseudo == player.pseudo){
				exist = true;
				console.log("Connection of : " + msg.pseudo);
				player = players[i];
				break;
			}
		}
		if(!exist){
			console.log("new user : " + msg.pseudo);
			players.push(player);
			console.log(players);
		}
		currentConnections[socket.id].data = player; 
		console.log(currentConnections);
	});
	
	socket.on('findUser', function(){
		console.log('Searching');
		currentConnections[socket.id].data.state = 1;
		for (i = 0; i < currentID.length; i++) {
    		if(currentConnections[currentID[i]].data && currentConnections[socket.id].data
				&& currentConnections[currentID[i]].data.pseudo != currentConnections[socket.id].data.pseudo
				&& currentConnections[socket.id].data.elo < currentConnections[currentID[i]].data.elo + 500 
				&& currentConnections[socket.id].data.elo > currentConnections[currentID[i]].data.elo - 500 
				&& currentConnections[currentID[i]].data.state == 1){
				currentConnections[currentID[i]].socket.emit('startFighting');
				currentConnections[socket.id].socket.emit('startFighting');
				console.log("Found 1");
				break;
			}
		}
	});
	
	socket.on('stopFindUser', function(){
		currentConnections[socket.id].data.state = 0;
	});
	
	socket.on('disconnect', function(){
		delete currentConnections[socket.id];
		delete currentID.remove(socket.id);
    	console.log('user disconnected');
  	});
});

//--------------------------------------------------

//Outil de suppression par valeur-------------------

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

//--------------------------------------------------

//Implémentation de find-------------------

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find a été appelé sur null ou undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate doit être une fonction');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

//--------------------------------------------------

//Paramètrage du port du serveur , et de l'adresse MongoDB

var port = process.env.PORT || 3000;

server.listen(port, function(socket) {
	console.log('listening on :' + port);
});

var url = 'mongodb://localhost:27017/videodb';

//--------------------------------------------------

