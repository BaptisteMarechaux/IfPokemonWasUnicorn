var PokeUnicornModule = (function(){
	var self = {};

	var instance;

	var calledMonsters = [];

	var playerStats = {
		maxHP : 20,
		hP : 20,
		time : 0,
		str : 10,
		def : 12,
		spe : 9,
		spA : 10,
		spd : 11
	};

	var enemyStats = {
		maxHP : 20,
		hP : 20,
		time : 0,
		str : 10,
		def : 10,
		spe : 10,
		spA : 11,
		spd : 11
	};

	var mainCommands,attackCommands;
	var enemyHPBar, playerHPBar;
	var enemySpeedGauge,playerSpeedGauge;

	self.pokemonUnicorn = function() {
		instance = this;
		instance._initialize();
	};

	self.pokemonUnicorn.prototype = {
		_initialize : function() {
			console.log("initialized");
			mainCommands = document.getElementsByClassName("mainCommands")[0];

			attackCommands = document.getElementsByClassName("attackCommands")[0];

			enemyHPBar = document.getElementById("enemyActualHP");
			enemySpeedGauge = document.getElementById("enemyActualSpeed");
			playerHPBar = document.getElementById("playerActualHP");
			playerSpeedGauge = document.getElementById("playerActualSpeed");

			requestAnimationFrame(this.update);
			//setInterval(this.update, 20);

		},
		selectFight : function() {
			console.log("Fight !");
			mainCommands.className = "mainCommands hidden";
			attackCommands.className = "attackCommands";
			
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
		update : function() {
			console.log("updating");

			if(playerStats.time < 100)
				playerStats.time += 1*0.2*playerStats.spe*0.5;
			if(enemyStats.time < 100)
				enemyStats.time += 1*0.2*enemyStats.spe*0.5;

			playerSpeedGauge.style.width = playerStats.time + "%";
			enemySpeedGauge.style.width = enemyStats.time + "%";

			requestAnimationFrame(self.pokemonUnicorn.prototype.update);
		}

	};

	socket.on('attackDone', function() {
		console.log("An attackhas been initiated");
	});

	return self;
})();