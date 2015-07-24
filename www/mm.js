(function() {

var canvas = document.getElementById('main_canvas');
if (canvas == null) return false;

canvas.width = document.body.clientWidth - 50;
canvas.height = document.body.clientHeight - 50;
console.log(canvas);

var context = canvas.getContext("2d");

var Map = {
	width : 1000,
	height : 1000,
	minRadius : 5,
	circles : [],
	players : {},
	over : false,
};

var Viewport = {
	x : Map.width / 2,
	y : Map.height / 2,
	width : canvas.width,
	height : canvas.height,
};

var getRandowmColor = function() {
	var c = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
	var color = '#';
	for (var i = 0; i < 6; i++) {
		var index = Math.floor(Math.random() * c.length);
		color += c[index];
	}
	return color;
};

var Circle = function(options) {
	options = options || {};
	this.init(options);
};

Circle.index = 0;

Circle.prototype.init = function(options) {
	this.id = Circle.index++;
	this.name = options.name || this.id;
	this.x = options.x || Map.width / 2;
	this.y = options.y || Map.height / 2;
	this.speedx = options.speedx || 0;
	this.speedy = options.speedy || 0;
	this.r = options.r || Map.minRadius;
	this.isFollow = options.isFollow || false;
	this.color = options.color || getRandowmColor();
	this.updatetime = Date.now();
};

Circle.prototype.destroy = function() {
	var self = this;
	Map.circles.forEach(function(circle, i) {
		if (circle != self) return;
		Map.circles.splice(i, 1);
	});
};

Circle.prototype.update = function() {
	var past = Date.now() - this.updatetime;
	this.updatetime = Date.now();
	this.x += this.speedx * past / 100;
	this.y += this.speedy * past / 100;
	this.x = Math.max(0, this.x);
	this.y = Math.max(0, this.y);
	this.x = Math.min(Map.width, this.x);
	this.y = Math.min(Map.height, this.y);

	if (this.isFollow) {
		Viewport.x = this.x;
		Viewport.y = this.y;
	}


	//collide test
	var self = this;
	Map.circles.forEach(function(circle) {
		if (self == circle) return;
		var length = Math.sqrt((circle.x - self.x) * (circle.x - self.x) + (circle.y - self.y) * (circle.y - self.y));
		var maxR = Math.max(circle.r, self.r);
		var minR = Math.min(circle.r, self.r);
		var winner = null;
		var loser = null;
		if (circle.r < self.r) {
			winner = self;
			loser = circle;
		} else if (circle.r > self.r) {
			winner = circle;
			loser = self;
		}
		if (maxR - minR > length && winner) {
			winner.r += loser.r / 10;
			loser.destroy();
		}
	});
	// console.log(past, this.x, this.y, this.speedx, this.speedy);
};

Circle.prototype.draw = function() {
	context.beginPath();
	context.arc(
		this.x - (Viewport.x - Viewport.width / 2),
		this.y - (Viewport.y - Viewport.height / 2),
		this.r,
		0,
		Math.PI * 2, true
	);
	context.closePath();
	context.fillStyle = this.color;
	context.fill();

	context.fillStyle = '#fff';
	context.font = (this.r + 5) + "px Arial";
	context.fillText(
		this.name,
		this.x - (Viewport.x - Viewport.width / 2) - this.r / 1.55,
		this.y - (Viewport.y - Viewport.height / 2) + this.r / 3
	);
};

//----------------------------------------------
// Main Loop
//----------------------------------------------
setInterval(function() {
	context.clearRect(0, 0, Viewport.width, Viewport.height);
	Map.circles.forEach(function(circle) {
		circle.update();
		// circle.draw();
	});

	// console.log(player.x, player.y);

	// Map.draw();
	Map.circles.forEach(function(circle) {
		circle.draw();
	});

	updateScore();

}, 1000 / 30);

//----------------------------------------------
// Player Character
//----------------------------------------------
var onMouseDown = function(evt) {
	changeDirection(evt.clientX, evt.clientY);
	isMouseDown = true;
};
var onMouseUp = function(evt) {
	isMouseDown = false;
};
var onMouseMove = function(evt) {
	if (isMouseDown) changeDirection(evt.clientX, evt.clientY);
};

var onKeyPress = function(evt) {
	console.log(evt);
};

var player = new Circle({
	name: '呆',
	r : 25,
	// color : '#f00',
	isFollow : true,
});
var player2;
Map.circles.push(player);

player.maxspeed = 100;
player.minspeed = 1;
var isMouseDown = false;

var changeDirection = function(posX, posY) {
	var speed_scale = 10;
	var speedx = (posX - Viewport.width / 2) / speed_scale;
	var speedy = (posY - Viewport.height / 2) / speed_scale;
	var tmpspeed = Math.sqrt(speedx * speedx + speedy * speedy);
	if (tmpspeed < player.minspeed) {
		speedx = 0;
		speedy = 0;
	} else if (tmpspeed > player.maxspeed) {
		speedx = speedx / tmpspeed * player.maxspeed;
		speedy = speedy / tmpspeed * player.maxspeed;
	}
	console.log(speedx, speedy);
	player.speedx = speedx;
	player.speedy = speedy;

	if (player2) {
		player2.speedx = speedx;
		player2.speedy = speedy;
	}
	// player.update();

};

//----------------------------------------------
// Bot Character
//----------------------------------------------
var addBot = function(name) {
	var circle = new Circle({
		name : name,
		x : Math.random() * Map.width,
		y : Math.random() * Map.height,
		speedx: Math.random() * 2,
		speedy: Math.random() * 2,
		r : 15,
	});
	Map.circles.push(circle);
};


//----------------------------------------------
// Tools
//----------------------------------------------
var onAddBotClick = function() {
	for (var i = 0; i < 50; i++) {
		addBot('Mi');
	}
};

var updateScore = function() {
	var scores = {};
	Map.circles.forEach(function(circle) {
		if (scores[circle.name]) {
			scores[circle.name]++;
		} else scores[circle.name] = 1;
	});

	var $leaderboard = document.getElementById('leaderboard');
	var html = '';
	for (var key in scores) {
		html += ['<li>', key , ': ' , scores[key], '</li>'].join('');
	}
	$leaderboard.innerHTML = html;

	var $tips = document.getElementById('tips');
	if (!Map.over && player.r >= 60) {
		$tips.innerHTML = 'Touch to Explode';
		$tips.className = 'wait';
	}
};

var gameOver = function() {
	if (!Map.over && player.r >= 60) {
		player2 = new Circle({
			name: player.name,
			r : player.r / 2,
			x : player.x + player.r,
			y : player.y,
			speedx : player.speedx,
			speedy : player.speedy,
			color: player.color,
			// color : '#f00',
			isFollow : true,
		});
		Map.circles.push(player2);
		player.r /= 2;

		var $tips = document.getElementById('tips');
		$tips.innerHTML = 'Mi Love Mei';
		Map.over = true;
	}
};

canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("keydown", onKeyPress, true);
document.getElementById('btn_addbot').addEventListener('click', onAddBotClick);
document.getElementById('tips').addEventListener('mousedown', gameOver);
})();