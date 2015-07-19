var Player = require('./Player');

var Game = module.exports = {
	width : 500,
	height : 500,
	minRadius : 5,
	players : {},
	clients : [],
	minPlayers : 50,
};

// Game.clearCollideList = function() {
// 	this.collideList = [];
// 	this.players.forEach(function(player, index) {
// 		this.collideList.push([]);
// 	})
// }

Game.checkCollide = function(player) {
	var self = this;
	// var player = self.players[index];
	// self.players.forEach(function(target, targetIndex) {
	for (var targetIndex in self.players) {
		var target = self.players[targetIndex];
		if (player == target) return;
		var distance = Math.sqrt((target.x - player.x) * (target.x - player.x) + (target.y - player.y) * (target.y - player.y));
		var maxR = Math.max(target.r, player.r);
		var minR = Math.min(target.r, player.r);
		var winner = null;
		var loser = null;
		if (target.r < player.r) {
			winner = player;
			loser = target;
		} else if (target.r > player.r) {
			winner = target;
			loser = player;
		}

		if (maxR - minR > distance && winner) {
			winner.r += loser.r / 10;
			Game.update(winner);
			Game.quit(loser);
		}
	}
};

Game.quit = function(player) {
	// var index = this.players.indexOf(player);
	// if (index >= 0) this.players.splice(index, 1);
	delete this.players[player.id];
	player.leave();
	this.broadcast({ action: 'quit', player: player.id });
	// this.update(player);
};

Game.update = function(player) {
	// var index = this.players.indexOf(player);
	this.broadcast({ action: 'update', player: player.id, info: player.info() });
};

// Game.addBot = function() {
// 	var circle = new Circle({
// 		x : Math.random() * Map.width,
// 		y : Math.random() * Map.height,
// 	});
// 	Map.circles.push(circle);
// };

Game.start = function() {
	var self = this;
	if (self.timer) clearInterval(self.timer);
	self.timer = setInterval(function() {
		// self.clearCollideList();
		// self.players.forEach(function(player, index) {
		for (var key in self.players) {
			var player = self.players[key];
			player.update();
			self.checkCollide(player);
		}
	}, 30);

	self.timer2 = setInterval(function() {
		var length = 0;
		for (var key in self.players) { length++; }
		while (length++ < self.minPlayers) {
			var player = new Player({
				x: Math.random() * self.width,
				y: Math.random() * self.height,
				r: 5,
				Game: self,
			});
			self.players[player.id] = player;
			// var index = self.players.push(player) - 1;
			self.broadcast({ action: 'join', player: player.id, info: player.info() });
			// console.log([new Date(), 'add bot current:', self.players.length].join(' '));
		}
	}, 5 * 1000)
};

//----------------------------------------------
// Client Action(s)
//----------------------------------------------
Game.onAccept = function(client) {
	this.clients.push(client);
};

Game.onLeave = function(client) {
	var index = this.clients.indexOf(client);
	this.clients.splice(index, 1);

	if (client.player) {
		Game.quit(client.player);
	}
};

Game.syncInfo = function() {

	var result = {
		width : 500,
		height : 500,
		players: {},
	};

	// this.players.forEach(function(player) {
	for (var key in this.players) {
		var player = this.players[key];
		result.players[player.id] = player.info();
	}

	return result;
};

Game.onMessage = function(client, params) {
	// console.log(params);
	var player = client.player;
	var action = params && params.action ? params.action : '';
	if (!player) {

		if (action == 'join') {
			player = new Player({
				x: Math.random() * this.width,
				y: Math.random() * this.height,
				name: params.name,
				color: params.color,
				r: 15,
				Game: this,
			});
			this.players[player.id] = player;
			this.broadcast({ action: 'join', player: player.id, info: player.info() });
			this.broadcast({ action: 'play', player: player.id }, [client]);
			client.player = player;
		} else if (action == 'sync') {
			this.broadcast({ action: 'sync', info: Game.syncInfo() }, [client]);
		}
	}

	if (!player) return;

	if (action == 'move') {
		// player.move({ speedx: params.speedx, speedy: params.speedy });
		player.speedx = params.speedx || 0;
		player.speedy = params.speedy || 0;
		Game.update(player);
	} else if (action == 'quit') {
		Game.quit(player);
	} else if (action == 'sync') {
		this.broadcast({ action: 'sync', info: Game.syncInfo() }, [client]);
	}
};

Game.broadcast = function(json, clients) {
	var message = JSON.stringify(json);
	clients = clients || this.clients;
	clients.forEach(function(client) {
		client.sendUTF(message);
	});

	// console.log([new Date(), 'broadcast', message].join(' '));
}