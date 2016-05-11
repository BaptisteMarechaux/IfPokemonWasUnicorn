var PokeUnicornModule = (function(){
	var self = {};

	var instance;

	var calledMonsters = [];

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

			requestAnimationFrame(this.update);
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
				enemyStats.hP -= 2;

				playerStats.time = 0;
			}
			
		},
		detailMove : function(index){
			console.log("detailed move : "+index);
			socket.emit('getMoveInfo', {moveIndex : playerStats.move[index].moveIndex});
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
		update : function() {
			//console.log("updating");

			if(playerStats.time <= 100)
				playerStats.time += 1*0.2*playerStats.spe*0.5;
			if(enemyStats.time < 100)
			{
				enemyStats.time += 1*0.2*enemyStats.spe*0.5;
				if(enemyStats.time >= 100)
				{
					setTimeout(function() {
						if(playerStats.hP>0){
							playerStats.hP -=1;
							enemyStats.time = 0;
							console.log(playerStats.hP);
						}
					}, 2000);
					
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

	return self;
})();