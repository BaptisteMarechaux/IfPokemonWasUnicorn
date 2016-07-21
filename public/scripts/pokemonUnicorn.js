var PokeUnicornModule = (function(){
	var self = {};

	var instance;

	var calledMonsters = [];

	self.canStart = false;

	var playerStats = {
		name : "Squirtle",
		level : 5,
		maxHP : 20,
		hP : 20,
		time : 0,
		str : 10,
		def : 12,
		spe : 9,
		spA : 10,
		spd : 11,
		moves : []
	};

	var enemyStats = {
		name: "Bulbasaur",
		level: 5,
		maxHP : 20,
		hP : 20,
		time : 0,
		str : 9,
		def : 10,
		spe : 10,
		spA : 11,
		spd : 11,
		moves : []
	};

	var mainCommands,attackCommands;
	var enemyHPBar, playerHPBar;
	var enemySpeedGauge,playerSpeedGauge, playerHPText, enemyHPText,enemyUsedAction,playerUsedAction,playerPokemonName,enemyPokemonName;

	var paused = false;

	self.pokemonUnicorn = function() {
		instance = this;
		instance._initialize();
	};

	self.pokemonUnicorn.prototype = {
		_initialize : function() {
			mainCommands = document.getElementsByClassName("mainCommands")[0];

			attackCommands = document.getElementsByClassName("moveCommands")[0];

			playerPokemonName = document.getElementById("playerPokemonName");
			enemyPokemonName = document.getElementById("enemyPokemonName");

			enemyHPBar = document.getElementById("enemyActualHP");
			enemySpeedGauge = document.getElementById("enemyActualSpeed");
			playerHPBar = document.getElementById("playerActualHP");
			playerSpeedGauge = document.getElementById("playerActualSpeed");

			playerHPText = document.getElementById("playerHPText");
			enemyHPText = document.getElementById("enemyHPText");

			playerUsedAction = document.getElementById("playerUsedAction");
			enemyUsedAction = document.getElementById("enemyUsedAction");

			playerPokemonName.innerHTML = playerStats.name + " Lv." + playerStats.level;
			enemyPokemonName.innerHTML = enemyStats.name + " Lv." + enemyStats.level;

			//requestAnimationFrame(this.update);
			//setInterval(this.update, 20);

		},
		selectFight : function() {
			console.log("Fight !");
			mainCommands.className = "mainCommands hidden";
			attackCommands.className = "moveCommands";
			
		},
		selectPokemon : function() {
			console.log("Pokemon change !");
		},
		selectItem : function() {
			console.log("Item select");
		},
		selectSurrender : function() {
			console.log("I want to give up");
		},
		backToMainCommands : function(){
			mainCommands.className = "mainCommands";
			attackCommands.className = "moveCommands hidden";
		},
		useMove : function(index){
			if(index < 0)
				index=0;
			if(index>3)
				index=3;

			if(playerStats.time >= 100) { //Condition empechant de lancer une attaque avant la fin de son attente
				console.log("Your pokemon used move " + index);
				socket.emit('useMove', {moveIndex : index , userStats : playerStats, targetStats : enemyStats});
				//playerUsedAction.innerHTML = "";
				//enemyStats.hP -= 2;
				document.getElementById("playerUsedAction").innerHTML = playerStats.name + " used " + playerStats.moves[index];
				playerStats.time = 0;
			}
			
		},
		detailMove : function(index){
			console.log("detailed move : "+index);
			//socket.emit('getMoveInfo', {moveIndex : playerStats.moves[index].moveIndex});
		},
		updateSpeedGauge : function(){
			playerSpeedGauge.style.width = playerStats.time + "%";
			enemySpeedGauge.style.width = enemyStats.time + "%";
		},
		updateHPBar : function(){
			playerHPBar.style.width = (playerStats.hP*1.0/playerStats.maxHP*1.0)*100 + "%";
			enemyHPBar.style.width = (enemyStats.hP*1.0/enemyStats.maxHP*1.0)*100 + "%";
			playerHPText.innerHTML = playerStats.hP + "/" + playerStats.maxHP;
			enemyHPText.innerHTML = enemyStats.hP + "/" + enemyStats.maxHP;
		},
		connectUser : function(){
			socket.emit('connectUser', {pseudo : document.getElementById("pseudo").value, password : document.getElementById("password").value});
		},
		findUser : function(){
			console.log("finding");
			socket.emit("findUser");
		},
		stopFindUser : function(){
			console.log("stopFindUser");
			socket.emit("stopFindUser");
		},
		update : function() {
			//console.log("updating");

			if(playerStats.time <= 100)
				playerStats.time += 1*0.2*playerStats.spe*0.5;
			if(enemyStats.time < 100)
			{
				enemyStats.time += 1*0.2*enemyStats.spe*0.5;
				if(enemyStats.time >= 100)
				{
					/*
					setTimeout(function() {
						if(playerStats.hP>0){
							//playerStats.hP -=1;
							enemyStats.time = 0;
							console.log(playerStats.hP);
						}
					}, 2000);
					*/
					
				}
			}

			

			if(playerStats.hp < 0)
				playerStats.hp=0;
			if(enemyStats.hp < 0)
				enemyStats.hp=0;

			self.pokemonUnicorn.prototype.updateSpeedGauge();
			self.pokemonUnicorn.prototype.updateHPBar();

			if(!paused)
				requestAnimationFrame(self.pokemonUnicorn.prototype.update);
		}

	};

	socket.on('attackDone', function() {
		console.log("An attackhas been initiated");
		
	});
	
	socket.on('startFighting', function() {
		console.log("gooooo !");
		self.canStart = true;
		socket.emit('updateEnemy');
		requestAnimationFrame(self.pokemonUnicorn.prototype.update);
	});
	
	socket.on('receiveAttackPlayer', function() {
		playerStats.hP -= 2;
		
	});

	socket.on('attackPlayer', function() {
		enemyStats.hP -= 2;
		
	});

	socket.on('userConnected', function(connectedUser) {
		console.log(connectedUser);
		playerStats.name = connectedUser.monsters[0].monsterName;
		playerPokemonName.innerHTML = connectedUser.monsters[0].monsterName + " Lv." + connectedUser.monsters[0].monsterLevel;
		document.getElementById("playerImageSprite").src = connectedUser.monsters[0].monsterBackImage;

		//Moves
		playerStats.moves[0] = connectedUser.monsters[0].monsterMoves[0];
		playerStats.moves[1] = connectedUser.monsters[0].monsterMoves[1];
		playerStats.moves[2] = "-";
		playerStats.moves[3] = "-";
		for(var i=0;i<4;i++)
		{
			document.getElementById("move"+(i+1)).innerHTML = playerStats.moves[i];
		}
		
		//Stats
		playerStats.maxHP = connectedUser.monsters[0].monsterMaxHP;
		playerStats.hP = connectedUser.monsters[0].monsterHP;
		playerStats.str = connectedUser.monsters[0].monsterStr;
		playerStats.def = connectedUser.monsters[0].monsterDef;
		playerStats.spe = connectedUser.monsters[0].monsterSpe;
		playerStats.spA = connectedUser.monsters[0].monsterSpA;
		playerStats.spD = connectedUser.monsters[0].monsterSpD;

		
		//enemyPokemonName.innerHTML = enemyStats.name + " Lv." + enemyStats.level;
	});

	socket.on('enemyUpdated', function(enemy) {

		enemyStats.name = enemy.monsters[0].monsterName;
		enemyPokemonName.innerHTML = enemy.monsters[0].monsterName + " Lv." + enemy.monsters[0].monsterLevel;
		document.getElementById("enemyImageSprite").src = enemy.monsters[0].monsterFrontImage;
		enemyStats.maxHP = enemy.monsters[0].monsterMaxHP;
		enemyStats.hP = enemy.monsters[0].monsterHP;
		
		enemyStats.str = enemy.monsters[0].monsterStr;
		enemyStats.def = enemy.monsters[0].monsterDef;
		enemyStats.spe = enemy.monsters[0].monsterSpe;
		enemyStats.spA = enemy.monsters[0].monsterSpA;
		enemyStats.spD = enemy.monsters[0].monsterSpD;
	});

	return self;
})();