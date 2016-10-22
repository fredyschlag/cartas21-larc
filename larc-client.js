var net = require('net');
var dgram = require('dgram');
const LARC_SERVER = 'larc.inf.furb.br';
var clients = [];

module.exports = {
  	sendTCP: function sendTCP(id, req, res, handler, callback, enqueued) {
		var client = null;
		if (clients[id]) {
			client = clients[id];
			if (!enqueued) {
				enqueueRequest(id, req, res, handler, callback, client);
			}

			if (client.queue.length == 1) {		
				initClient(client, req, res, handler);
				console.log('Client already connected: ' + id);
				callback(client);
			}
		} else {
			client = new net.Socket();
			client.queue = [];
			enqueueRequest(id, req, res, handler, callback, client);
			clients[id] = client;			
			initClient(client, req, res, handler);

			client.on('data', function (data) {						
				client.handleRequest(data, client);
				client.queue = client.queue.slice(1);
				if (client.queue.length > 0) {
					var request = client.queue[0];
					console.log('call enqueued');
					sendTCP(request.id, request.req, request.res, request.handler, request.callback, true);
				}
			});

			client.on('error', function (data) {						
				client.handleRequest(data, client, true);
				client.queue = client.queue.slice(1);
				if (client.queue.length > 0) {
					var request = client.queue[0];				
					sendTCP(request.id, request.req, request.res, request.handler, request.callback, true);				
				}
				clients[id] = null;
			});

			console.log('Conenctando-se ao LARC...');
			client.connect(1012, LARC_SERVER, function () {		
				console.log('Client connected: ' + id);				
				callback(client);
			});		
		};
	},

  	sendUDP: function (id, req, res, handler, message) {
		var client = dgram.createSocket('udp4');
		initClient(client, req, res, handler);
		console.log('Requisição enviada ao LARC: ' + message);
		client.send(message, 0, message.length, 1011, LARC_SERVER, function(err, bytes) {
		    if (err) {
		    	throw err;
		    };

		    client.handleRequest(bytes, client);
		    client.close();
		});
	}
};

function initClient(client, req, res, handler) {
	client.req = req;
	client.res = res;
	client.handleRequest = handler;
};

function enqueueRequest(id, req, res, handler, callback, client) {
	var requestQueued = {};
	requestQueued.id = id;
	requestQueued.req = req;
	requestQueued.res = res;
	requestQueued.handler = handler;
	requestQueued.callback = callback;
	client.queue.push(requestQueued);
};