var net = require('net');
var dgram = require('dgram');
const LARC_SERVER = 'larc.inf.furb.br';
var clients = [];

module.exports = {
  	sendTCP: function (id, req, res, handler, callback) {
		var client = null;
		if (clients[id]) {
			client = clients[id];
			initClient(client, req, res, handler);
			console.log('Client already connected: ' + id);
			callback(client);
		} else {
			client = new net.Socket();
			initClient(client, req, res, handler);

			client.on('data', function (data) {						
				client.handleRequest(data, client);
			});

			client.connect(1012, LARC_SERVER, function () {		
				console.log('Client connected: ' + id);
				clients[id] = client;
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