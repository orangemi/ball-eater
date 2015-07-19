(function() {

var canvas = document.getElementById('main_canvas');
if (canvas == null) return false;
var context = canvas.getContext("2d");

var Viewport = {
	x : 0,
	y : 0,
	width : canvas.width,
	height : canvas.height,
	timer : null,
};

var Map = {
	width : 500,
	height : 500,
	minRadius : 5,
	circles : {},
	// players : {},
};

var Viewport = {
	x : Map.width / 2,
	y : Map.height / 2,
	width : canvas.width,
	height : canvas.height,
};

var isMouseDown = false;

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
	return;
	var self = this;
	// Map.circles.forEach(function(circle, i) {
		// if (circle != self) return;
		// Map.circles.splice(i, 1);
	// })
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


	// //collide test
	// var self = this;
	// for (var key in Map.circles) {//.forEach(function(circle) {
	// 	var circle = Map.circles[key];
	// 	if (self == circle) return;
	// 	var length = Math.sqrt((circle.x - self.x) * (circle.x - self.x) + (circle.y - self.y) * (circle.y - self.y));
	// 	var maxR = Math.max(circle.r, self.r);
	// 	var minR = Math.min(circle.r, self.r);
	// 	var winner = null;
	// 	var loser = null;
	// 	if (circle.r < self.r) {
	// 		winner = self;
	// 		loser = circle;
	// 	} else if (circle.r > self.r) {
	// 		winner = circle;
	// 		loser = self;
	// 	}
	// 	if (maxR - minR > length && winner) {
	// 		winner.r += loser.r;
	// 		loser.destroy();
	// 	}
	// }
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
	var key, circle;
	for (key in Map.circles) {
		circle = Map.circles[key];
		//.forEach(function(circle) {
		circle.update();
		// circle.draw();
	}
	
	if (player) console.log(player.x, player.y);

	// Map.draw();
//	Map.circles.forEach(function(circle) {
	for (key in Map.circles) {
		circle = Map.circles[key];
		circle.draw();
	}
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

// var player = new Circle({
// 	r : 15,
// 	isFollow : true,
// });
// Map.circles.push(player);

// player.maxspeed = 100;
// player.minspeed = 1;
// var isMouseDown = false;
var player = null;

var changeDirection = function(posX, posY) {
	if (!player) return;

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
	// player.speedx = speedx;
	// player.speedy = speedy;
	// player.update();
	send({
		action: 'move',
		speedx: speedx,
		speedy: speedy,
	});

};

var host = location.host;
var ws = null; 
ws = new WebSocket('ws://' + host, 'viga_v1');
ws.onopen = function () {
// ws is opened and ready to use
	console.log('connected');
	send({action: 'sync'});
};

ws.onerror = function (error) {
	// an error occurred when sending/receiving data
	console.error(error);
};

ws.onmessage = function (message) {
	var json = null;
	try {
		json = JSON.parse(message.data);
	} catch (e) { return; }
	// handle incoming message
	console.log(json);
	var action = json && json.action ? json.action : '';
	if (action == 'sync') {
		console.log(json);
		Map.height = json.info.height;
		Map.width = json.info.width;
		Map.circles = {};
		for (var id in json.info.players) {//.forEach(function(player) {
			var player2 = json.info.players[id];
			Map.circles[player2.id] = new Circle({
				id: player2.id,
				x: player2.x,
				y: player2.y,
				speedx: player2.speedx,
				speedy: player2.speedy,
				r: player2.r,
				name: player2.name,
				color: player2.color,
			});
		};
	} else if (action == 'quit') {
		delete Map.circles[json.player];//.splice(json.player, 1);
	} else if (action == 'join') {
		Map.circles[json.info.id] = new Circle({
		// Map.circles.push(new Circle({
			x: json.info.x,
			y: json.info.y,
			speedx: json.info.speedx,
			speedy: json.info.speedy,
			r: json.info.r,
			name: json.info.name,
			color: json.info.color,
		});
	} else if (action == 'update') {
		var circle = Map.circles[json.player];
		circle.x = json.info.x;
		circle.y = json.info.y;
		circle.speedx = json.info.speedx;
		circle.speedy = json.info.speedy;
		circle.r = json.info.r;
	} else if (action == 'play') {
		var circle = Map.circles[json.player];
		circle.isFollow = true;
		player = circle;
		player.maxspeed = 100;
		player.minspeed = 1;
	}
};

var send = function(json) {
	ws.send(JSON.stringify(json));
};

var onLoginClick = function() {
	var name = document.getElementById('txt_player_name').value;
	send({
		action: 'join',
		name: name,
		color: '#f00',
	});
}

var btn_login = document.getElementById('btn_login');
btn_login.addEventListener('click', onLoginClick);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mouseup", onMouseUp, false);

})();