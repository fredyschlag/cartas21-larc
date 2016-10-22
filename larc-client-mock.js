var net = require('net');
var dgram = require('dgram');
const LARC_SERVER = 'larc.inf.furb.br';
var clients = [];

module.exports = {
  	sendTCP: function sendTCP(id, req, res, handler, callback, enqueued) {
		var client = {};
		client.req = req;
		client.res = res;

		client.write = function (data) {
			if (data == 'GET USERS 1000:senha') {
				handler('1000:Usuário teste:1:1001:Usuário test:0:', client);
			}
		};

		callback(client);
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