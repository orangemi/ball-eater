(function() {

var canvas = document.getElementById('main_canvas');
if (canvas == null) return false;
var width = canvas.width;
var height = canvas.height;

console.log(canvas);
var context = canvas.getContext("2d");

var onMouseDown = function(evt) {
	console.log(evt);
	changeDirection(evt.clientX, evt.clientY);
}

var changeDirection = function(posX, posY) {
	var speed_scale = 100;
	var min_speed = 0.1;
	speed_x = (posX - width / 2) / speed_scale;
	speed_y = (posY - height / 2) / speed_scale;
	var tmp_speed = Math.sqrt(speed_x * speed_x + speed_y * speed_y);
	if (tmp_speed < min_speed) {
		speed_x = 0;
		speed_y = 0;
	} else if (tmp_speed > max_speed) {
		speed_x = speed_x / tmp_speed * max_speed;
		speed_y = speed_y / tmp_speed * max_speed;
	}
	console.log(speed_x, speed_y);
};

var onMouseMove = function(evt) {
	// console.log(evt);
};

canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mousemove", onMouseMove, false);

var x = width / 2;
var y = height / 2;
var r = 20;
var speed_x = 0;
var speed_y = 0;
var max_speed = 1;

var circle = function(x, y, r, fill) {
	fill = fill || false;
	context.beginPath();
	context.arc(x, y, r, 0, Math.PI * 2, true);
	context.closePath();
	context.fillStyle = 'rgb(0,0,0)';
	context.fill();
}

setInterval(function() {
	context.clearRect(0, 0, width, height);
	circle(x, y, r, true);
	// context.fillRect(x, 0, 100, 100);
	x += speed_x;
	y += speed_y;
}, 10);

})();