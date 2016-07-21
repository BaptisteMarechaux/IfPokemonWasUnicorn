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

var url = 'mongodb://localhost:27017/explodb';

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

var room = {
	players : []
};

var rooms = [];


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
		if (rooms[0].players[0].socket == socket){
			rooms[0].players[1].socket.emit('receiveAttackPlayer');
			rooms[0].players[0].socket.emit('attackPlayer');
		}else{
			rooms[0].players[0].socket.emit('receiveAttackPlayer');
			rooms[0].players[1].socket.emit('attackPlayer');
		}
	});

	socket.on('updateEnemy', function(){
		console.log('updateEnemy');
		console.log(rooms[0].players[0]);
		console.log(rooms[0]);
		
		if (rooms[0].players[0].socket == socket){		
			MongoClient.connect(url, function(err, db) {
				findUserWithName(db, rooms[0].players[1].data.pseudo, function(res){
					rooms[0].players[0].socket.emit('enemyUpdated', res);
				});
			});
			

		}else{
			MongoClient.connect(url, function(err, db) {
				findUserWithName(db, rooms[0].players[0].data.pseudo, function(res){
					rooms[0].players[1].socket.emit('enemyUpdated', res);
				});
			});
			
		}
		
	});

	socket.on('connectUser', function(msg){
		player = {
			pseudo : msg.pseudo,
			password : msg.password,
			state : 0,
			elo : 1200,
		};
		var exist = false;
		/*for(i = 0; i < players.length; i++) {
			if(players[i].pseudo == player.pseudo){
				exist = true;
				console.log("Connection of : " + msg.pseudo);
				player = players[i];
				break;
			}
		}*/
		MongoClient.connect(url, function(err, db) {
			assert.equal(null, err);
				findUser(db, msg.pseudo, msg.password, function(user){
					if(user.length > 0){
						exist = true;
						player = user[0];
						socket.emit("userConnected", player);
						console.log("Connection of : " + msg.pseudo);
						currentConnections[socket.id].data = player;
					}
					else
					{
						assert.equal(null, err);
						insertUser(db, player.pseudo, player.password, player.state, player.elo, function(addedUser) {
							db.close();
							socket.emit("userConnected", addedUser);
							currentConnections[socket.id].data = player;
						});
					}
				});
		});
		/*
		if(!exist){
			console.log("new user : " + msg.pseudo);
			//players.push(player);
			MongoClient.connect(url, function(err, db) {
				assert.equal(null, err);
				insertUser(db, player.pseudo, player.password, player.state, player.elo, function(addedUser) {
					db.close();
					socket.emit("userConnected", addedUser);
				});
			});
			console.log(players);
		}*/
		//currentConnections[socket.id].data = player; 
		//console.log(currentConnections);
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
				tmpRoom = room;
				tmpRoom.players.push(currentConnections[currentID[i]]);
				tmpRoom.players.push(currentConnections[socket.id]);
				rooms.push(tmpRoom);
				break;
			}
		}

		/*findUser(function(sentTab) {
			socket.emit('foundUser', sentTab);
		})*/
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


//----------------- Mongo Connection ---------------

var insertUser = function(db, pseudo, password, state, elo, callback) {

	var rand = Math.floor((Math.random() * 3) + 1);
	var addedMonster = {};
	if(rand == 1)
	{
		addedMonster = {
			monsterName : "Bulbasaur",
	  		monsterFrontImage : "/public/img/battlers/front/001.png",
	  		monsterBackImage : "/public/img/battlers/back/001b.png",
	  		level: 5,
			maxHP : 20,
			hP : 20,
			time : 0,
			str : 9,
			def : 10,
			spe : 10,
			spA : 11,
			spD : 11,
			moves : ["Tackle", "Growl"]
		}
	}
	else if(rand == 2)
	{
		addedMonster = {
			monsterName : "Charmander",
	  		monsterFrontImage : "/public/img/battlers/front/004.png",
	  		monsterBackImage : "/public/img/battlers/back/004b.png",
	  		level: 5,
			maxHP : 20,
			hP : 20,
			time : 0,
			str : 11,
			def : 9,
			spe : 10,
			spA : 11,
			spD : 12,
			moves : ["Scratch", "Smokescreen"]
		}
	}
	else if(rand == 3)
	{
		addedMonster = {
			monsterName : "Suqirtle",
	  		monsterFrontImage : "/public/img/battlers/front/007.png",
	  		monsterBackImage : "/public/img/battlers/back/007b.png",
	  		level: 5,
			maxHP : 20,
			hP : 20,
			time : 0,
			str : 10,
			def : 12,
			spe : 9,
			spA : 10,
			spD : 12,
			moves : ["Bite", "Tail Whip"]
		}
	}
	var addedUser = {
		monsterName : addedMonster.monsterName,
  		monsterFrontImage : addedMonster.monsterFrontImage,
  		monsterBackImage : addedMonster.monsterBackImage,
  		monsterLevel : addedMonster.level,
  		monsterMaxHP : addedMonster.maxHP,
  		monsterHP : addedMonster.hP,
  		monsterTime : addedMonster.time,
  		monsterStr : addedMonster.str,
  		monsterDef : addedMonster.def,
  		monsterSpe : addedMonster.spe,
  		monsterSpA : addedMonster.spA,
  		monsterSpD : addedMonster.spD,
  		monsterMoves : [addedMonster.moves[0], addedMonster.moves[1]]
	};
   db.collection('users').insertOne( {
      "pseudo" : pseudo,
      "password" : password,
      "state" : state,
	  "elo" : elo,
	  "monsters":[
	  	{
	  		"monsterName" : addedMonster.monsterName,
	  		"monsterFrontImage" : addedMonster.monsterFrontImage,
	  		"monsterBackImage" : addedMonster.monsterBackImage,
	  		"monsterLevel" : addedMonster.level,
	  		"monsterMaxHP" : addedMonster.maxHP,
	  		"monsterHP" : addedMonster.hP,
	  		"monsterTime" : addedMonster.time,
	  		"monsterStr" : addedMonster.str,
	  		"monsterDef" : addedMonster.def,
	  		"monsterSpe" : addedMonster.spe,
	  		"monsterSpA" : addedMonster.spA,
	  		"monsterSpD" : addedMonster.spD,
	  		"monsterMoves" : [addedMonster.moves[0], addedMonster.moves[1]]
	  	}
	  ]
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the users collection.");
    callback(addedUser);
  });
};

var findUser = function(db, pseudo, password, callback) {
   var cursor =db.collection('users').find( { "pseudo": pseudo, "password": password} );
   var results = [];
   cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         results.push(doc);
      } else {
      	console.log(results);
         callback(results);
      }
   });
};

var findUserWithName = function(db, pseudo, callback){
	var cursor = db.collection('users').find( { "pseudo": pseudo} );
	var results = [];
	cursor.each(function(err, doc) {
		assert.equal(err, null);
		if (doc != null) {
			results.push(doc);
		} else {
			console.log(results);
			callback(results[0]);
		}
	});
};
