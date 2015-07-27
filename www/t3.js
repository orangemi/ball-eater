(function() {

var canvas = document.getElementById('main_canvas');
if (!canvas) return false;

canvas.width = document.body.clientWidth - 50;
canvas.height = document.body.clientHeight - 150;
// console.log(canvas);

var context = canvas.getContext("2d");

var Map = {
	width : 1000,
	height : 1000,
	minRadius : 5,
	circles : {},
};

var Viewport = {
	x : Map.width / 2,
	y : Map.height / 2,
	width : canvas.width,
	height : canvas.height,
	scale : 1,
};

console.log(Viewport);

var isMouseDown = false;

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
	this.name = options.name;
	this.x = options.x || Map.width / 2;
	this.y = options.y || Map.height / 2;
	this.speedx = options.speedx || 0;
	this.speedy = options.speedy || 0;
	this.r = options.r || Map.minRadius;
	this.isFollow = options.isFollow || false;
	this.color = options.color || getRandowmColor();
	this.updatetime = Date.now();
	this.maxspeed = options.maxspeed || 50;
};

Circle.prototype.destroy = function() {
	return;

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
		Viewport.scale = Math.min(Viewport.height, Viewport.width) / 10 / this.r;
		// console.log(Viewport.scale);
	}
};

Circle.prototype.draw = function() {
	context.beginPath();
	context.arc(
		(this.x - Viewport.x) * Viewport.scale + Viewport.width / 2,
		(this.y - Viewport.y) * Viewport.scale + Viewport.height / 2,
		this.r * Viewport.scale,
		0,
		Math.PI * 2, true
	);

	// if (player == this) console.log((this.x - (Viewport.x - Viewport.width / 2 )) * 1, (this.y - (Viewport.y - Viewport.height / 2 )) * 1);

	context.closePath();
	context.fillStyle = this.color;
	context.fill();

	context.fillStyle = '#fff';
	context.font = (this.r) + "px Arial";
	context.textBaseline = 'middle';
 	context.textAlign = 'center';
	context.fillText(
		this.name,
		(this.x - Viewport.x) * Viewport.scale + Viewport.width / 2,
		(this.y - Viewport.y) * Viewport.scale + Viewport.height / 2
	);
};

function drawGrid(width, step) {
	context.save();
	context.strokeStyle = '#cccccc';
	context.fillStyle = '#ffffff';
	context.lineWidth = width || 0.5;
	context.fillRect(0, 0, Viewport.width, Viewport.height);
	for (var x = 0; x <= Map.width; x += step) {
		var px = (x - Viewport.x) * Viewport.scale + Viewport.width / 2;
		context.beginPath();
		context.moveTo(px, 0);
		context.lineTo(px, Viewport.height);
		context.stroke();
	}

	for (var y = 0; y <= Map.width; y += step) {
		var py = (y - Viewport.y) * Viewport.scale + Viewport.height / 2;
		context.beginPath();
		context.moveTo(0, py);
		context.lineTo(Viewport.width, py);
		context.stroke();
	}

	context.restore();
}

function updateScore() {
	var key, circle;
	var scores = [];

	for (key in Map.circles) {
		circle = Map.circles[key];
		var find = false;
		if (!circle.name) continue;
		for (var i = 0; i < scores.length; i++) {
			if (circle.r > scores[i].r) {
				scores.splice(i, 0, circle);
				find = true;
				break;
			}
		}
		if (!find) scores.push(circle);
	}

	var $leaderboard = document.getElementById('leaderboard');
	var html = '';
	for (key in scores) {
		circle = scores[key];
		var name = circle.name;
		var score = circle.r;
		html += ['<li>', name , ': ' , score, '</li>'].join('');
	}
	$leaderboard.innerHTML = html;
}

//----------------------------------------------
// Main Loop
//----------------------------------------------
setInterval(function() {
	context.clearRect(0, 0, Viewport.width, Viewport.height);

	drawGrid(1, 20);

	var key, circle;
	for (key in Map.circles) {
		circle = Map.circles[key];
		circle.update();
	}
	
	// if (player) console.log(player.x, player.y);

	// Map.draw();
	for (key in Map.circles) {
		circle = Map.circles[key];
		circle.draw();
	}

}, 1000 / 30);

setInterval(function() {
	updateScore();
}, 1000);

//----------------------------------------------
// Player Character
//----------------------------------------------
var onMouseDown = function(evt) {
	var x, y;
	if (evt.pageX || evt.pageY) { 
		x = evt.pageX;
		y = evt.pageY;
	} else { 
		x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;

	changeDirection(x, y);
	isMouseDown = true;
};
var onMouseUp = function(evt) {
	isMouseDown = false;
};
var onMouseMove = function(evt) {
	var x, y;
	if (evt.pageX || evt.pageY) { 
		x = evt.pageX;
		y = evt.pageY;
	} else { 
		x = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		y = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	} 
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;

	if (isMouseDown) changeDirection(x, y);
};


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
	// console.log(speedx, speedy);
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
	// console.log(json);
	var action = json && json.action ? json.action : '';
	if (action == 'sync') {
		// console.log(json);
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
		}
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
			maxspeed: json.info.maxspeed,
		});
		console.log(json.info.maxspeed);
	} else if (action == 'update') {
		var circle = Map.circles[json.player];
		circle.x = json.info.x;
		circle.y = json.info.y;
		circle.speedx = json.info.speedx;
		circle.speedy = json.info.speedy;
		circle.r = json.info.r;
		circle.maxspeed = json.info.maxspeed;
		console.log(json.info.maxspeed);
	} else if (action == 'play') {
		var circle = Map.circles[json.player];
		circle.isFollow = true;
		player = circle;
		console.log('max spd:', player.maxspeed);
		// player.maxspeed = 100;
		// player.minspeed = 1;
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
		color: getRandowmColor(),
		// color: '',
	});
};

var btn_login = document.getElementById('btn_login');
btn_login.addEventListener('click', onLoginClick);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mouseup", onMouseUp, false);

})();