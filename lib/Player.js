// var EventEmitter = require('events').EventEmitter;
var currentPlayerId = 1;

var Player = module.exports = function(options) {
	options = options || {};
	this.init(options);
};


Player.getRandomColor = function() {
	var c = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
	var color = '#';
	for (var i = 0; i < 6; i++) {
		var index = Math.floor(Math.random() * c.length);
		color += c[index];
	}
	return color;
};

// util.inherits(Player, EventEmitter);

Player.prototype.init = function(options) {
	this.id = currentPlayerId++;
	this.x = options.x || 0;
	this.y = options.y || 0;
	this.speedx = options.speedx || 0;
	this.speedy = options.speedy || 0;
	this.r = options.r || 10;
	this.name = options.name || '';
	this.color = options.color || '#000000';
	this.Game = options.Game;
	this.updatetime = Date.now();
	this.maxspeed = Math.max(5, 10 - this.r / 2);
	// this.client = options.client;
};

Player.prototype.update = function() {
	var past = Date.now() - this.updatetime;
	this.updatetime = Date.now();
	this.x += this.speedx * past / 100;
	this.y += this.speedy * past / 100;
	this.x = Math.max(0, this.x);
	this.y = Math.max(0, this.y);
	this.x = Math.min(this.Game.width, this.x);
	this.y = Math.min(this.Game.height, this.y);
	this.r -= this.r > 80 ? past / 100 * 1 : 0;
	this.maxspeed = Math.max(5, 10 - this.r / 2);
	// this.maxspeed = Math.max(10, 50 - this.r / 2);
};

// Player.prototype.join = function(options) {
// 	this.Game = options.Game;
// 	this.name = options.name || '';
// 	this.color = options.color || '#000000';
// };

Player.prototype.leave = function() {
	this.status = 'leave';
};

Player.prototype.info = function() {
	return {
		id: this.id,
		name: this.name,
		color: this.color,
		x: this.x,
		y: this.y,
		r: this.r,
		speedx: this.speedx,
		speedy: this.speedy,
		maxspeed: this.maxspeed,
	};
};