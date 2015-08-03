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
	this.r = this.originR = options.r || 10;
	this.name = options.name || '';
	this.color = options.color || '#000000';
	this.Game = options.Game;
	this.isNPC = options.isNPC || false;
	this.updatetime = Date.now();
	this.maxspeed = 9;
	// this.client = options.client;
};

Player.prototype.update = function() {
	var moved = false;

	var lastx = this.x;
	var lasty = this.y;
	var lastr = this.r;
	
	var past = Date.now() - this.updatetime;
	this.updatetime = Date.now();

	var recoveryR = Math.abs(this.originR - this.r) > 0 ? (this.recoveryR || 1) : 0;
	recoveryR = this.originR - this.r > 0 ? recoveryR : -1 * recoveryR;
	this.r += this.recoveryR * past / 100;
	this.r -= this.r > 80 ? past / 100 * 1 : 0;
	this.maxspeed = Math.max(0.5, 72 * Math.pow(this.r + 10, -0.5) - 7);
	var tmpspeed = Math.sqrt(this.speedx * this.speedx + this.speedy * this.speedy);
	if (tmpspeed > this.maxspeed) {
		this.speedx = this.speedx / tmpspeed * this.maxspeed;
		this.speedy = this.speedy / tmpspeed * this.maxspeed;
	}

	this.x += this.speedx * past / 100;
	this.y += this.speedy * past / 100;
	this.x = Math.max(0, this.x);
	this.y = Math.max(0, this.y);
	this.x = Math.min(this.Game.width, this.x);
	this.y = Math.min(this.Game.height, this.y);

	if (lastx != this.x || lasty != this.y || lastr != this.r) moved = true;
	return moved;

	// this.Game.
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

Player.prototype.use = function() {
	var item = this.item;
	if (!item) return false;
	if (item == 'Split') {

	} else if (item == 'Cold') {
		this.r -= 10;
	} else if (item == 'Hot') {
		this.r += 10;
	}

	return true;
};

Player.prototype.capture = function(target) {
	this.r += target.r / 10;
	this.originR += target.r / 10;

	if (target.isNPC && target.item) {
		this.item = target.item;
		if (this.client) this.broadcast({ action: 'obtain', item: target.item }, [this.client]);
	}

};