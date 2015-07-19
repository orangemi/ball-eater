(function() {

var canvas = document.getElementById('main_canvas');
if (canvas == null) return false;
console.log(canvas);

var context = canvas.getContext("2d");

var Map = {
	width : 500,
	height : 500,
	minRadius : 5,
	circles : [],
	players : {},
};

var Viewport = {
	x : Map.width / 2,
	y : Map.height / 2,
	width : canvas.width,
	height : canvas.height,
};

var getRandowmColor = function() {
	return "rgb(0,0,0)";
};

var Circle = function(options) {
	options = options || {};
	this.init(options);
};

Circle.prototype.init = function(options) {
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
	})
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
			winner.r += loser.r;
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
		Math.PI * 2, true);
	context.closePath();
	context.fillStyle = this.color;
	context.fill();
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
	
	console.log(player.x, player.y);

	// Map.draw();
	Map.circles.forEach(function(circle) {
		circle.draw();
	});
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

var player = new Circle({
	r : 15,
	isFollow : true,
});
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
	// player.update();

};

//----------------------------------------------
// Bot Character
//----------------------------------------------
var addBot = function() {
	var circle = new Circle({
		x : Math.random() * Map.width,
		y : Math.random() * Map.height,
	});
	Map.circles.push(circle);
};


//----------------------------------------------
// Tools
//----------------------------------------------
var onAddBotClick = function() {
	addBot();
};

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mouseup", onMouseUp, false);
document.getElementById('btn_addbot').addEventListener('click', onAddBotClick);

})();