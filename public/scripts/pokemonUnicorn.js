var PokeUnicornModule = (function(){
	var self = {};

	var instance;

	self.pokemonUnicorn = function() {
		instance = this;
		instance._initialize();
	};

	self.pokemonUnicorn.prototype = {
		_initialize : function() {
			console.log("initialized");
		},
		selectFight : function() {
			console.log("Fight !");
			socket.emit('attack');
		},
		selectPokemon : function() {
			console.log("Pokemon change !");
		},
		selectItem : function() {
			console.log("Item select");
		},
		selectSurrender : function() {
			console.log("I want to give up");
		}
	};

	socket.on('attackDone', function() {
		console.log("An attackhas been initiated");
	});

	return self;
})();