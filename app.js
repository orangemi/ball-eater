var Http = require('http');
var WebSocketServer = require('websocket').server;

var staticPath = __dirname + '/www';

var http = Http.createServer(function(request, response) {
	var method = request.method;
	var url = request.url;
	console.log([new Date(), method, url].join(' '));

	url = require('url').parse(url);
	require('fs').readFile(staticPath + url.pathname, function(error, result) {
		if (error) {
			response.statusCode = 404;
			response.end();
			return;
		}

		var mime = require('mime').lookup(url.pathname);
		response.setHeader('Content-Type', mime);
		response.write(result);
		response.end();
	});

	// response.writeHead(404);
	// response.end();
});

http.listen(80, function() {
	console.log((new Date()) + ' Server is listening on port 80');
});

//var clients = [];

var wss = new WebSocketServer({
	httpServer: http,
	autoAcceptConnections: false,
});

var Game = require('./lib/Game');
Game.start();

wss.on('request', function(request) {
	if (false) {
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	var client;
	try {
		client = request.accept('viga_v1', request.origin);
	} catch (e) { return; }

	Game.onAccept(client);
	//clients.push(client);
	console.log((new Date()) + ' Connection accepted.');

	client.on('message', function(message) {
		if (message.type !== 'utf8') return;
		var json = null;
		console.log('Received Message: ' + message.utf8Data);
		try {
			json = JSON.parse(message.utf8Data);
		} catch (e) {
			console.error(e);
		}

		Game.onMessage(client, json);

	});

	client.on('close', function(reasonCode, description) {
		Game.onLeave(client);
		// var index = clients.indexOf(client);
		// clients.splice(index, 1);
		console.log((new Date()) + ' Peer ' + client.remoteAddress + ' disconnected.');
	});
});