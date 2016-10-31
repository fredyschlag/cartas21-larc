var iconv = require('iconv-lite');

const GET_USERS = 'GET USERS {0}:{1}';
const GET_MESSAGE = 'GET MESSAGE {0}:{1}';
const SEND_MESSAGE = 'SEND MESSAGE {0}:{1}:{2}:{3}';

const GET_PLAYERS = 'GET PLAYERS {0}:{1}';
const GET_CARD = 'GET PLAYERS {0}:{1}';
const SEND_GAME = 'SEND GAME {0}:{1}:{2}';

var validateParams = function (req, res, params) {
	for (i = 0; i < params.length; i++) {
		if (!req.body.hasOwnProperty(params[i])) {
			res.status(500).send({ error: 'Parâmetro "{0}" não informado.'.format([params[i]]) } );
			return false;
		}
	};

	return true;
};

var handleRequest = function (req, res, larcClient, params, request, handleResponse, udp) {
	var body = req.body;
	console.log('Requisição recebida do cliente: ');
	console.log(body);
	if (!validateParams(req, res, params)) {
		return;
	};

	var handler = function(data, client, error) {
		var response = {};
		if (client.repeating) {
			response = client.responseClient;
		} else {
			client.responseClient = response;
		}
		
		response.userid = body.userid;
		if (!udp) {
			data = data.toString('utf8');
		};
		
		if (error) {
			console.log('Erro de conexão:');
			console.log(data);
			response.error = 'Erro de conexão com o servidor.';
			response.errorData = data;
		} else {
			console.log('Resposta do LARC:');
			console.log(data);
			handleResponse(data, response, client);
		}

		if (!client.repeating) {
			console.log('Resposta enviada ao cliente: ');
			console.log(response);
			client.res.send(response);
		}
	};

	request = iconv.encode(request, 'utf8');

	var sendRequest = function (client) {
		var operation = '(TCP)';
		if (udp) {
			operation = '(UDP)';
		}
		console.log('Requisição enviada ao LARC ' + operation + ': ' + request);
		client.write(request);		
	};	

	if (udp) {	
		larcClient.sendUDP(body.userid, req, res, handler, request);
	} else {
		larcClient.sendTCP(body.userid, req, res, handler, sendRequest);
	}
};

module.exports = {
	getUsers: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response) {
			response.users = [];			
			var arrData = data.split(':');				
			for (; arrData.length > 1;) {
				var user = {};
				user.userid = arrData[0];
				user.username = arrData[1];
				user.wins = arrData[2];		
				response.users.push(user);
				arrData = arrData.slice(3);
			};

			if (data.startsWith('Usuário inválido!')) {
				response.error = 'Usuário inválido.';
			};
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password'], 
					GET_USERS.format([body.userid, body.password]),
					handleResponse,
					false);		
	},
	getMessage: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response, client) {
			if (response.messages == undefined) {
				response.messages = [];
			}

			var arrData = data.split(':');				
			if ((arrData.length > 1) && (arrData[0] != '')){
				var message = {};
				message.userid = arrData[0];
				message.msg = arrData.slice(1).join(':');
				response.messages.push(message);
				larcClient.repeatRequest(client);
			} else {
				client.repeating = false;
			};			
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password'], 
					GET_MESSAGE.format([body.userid, body.password]),
					handleResponse,
					false);		
	},
	sendMessage: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response) {
			response.status = 'ok';
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password', 'targetuserid', 'msg'], 
					SEND_MESSAGE.format([body.userid, body.password, body.targetuserid, body.msg]),
					handleResponse
					,body.udp);		
	},
	getPlayers: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response) {
			response.players = [];
			var arrData = data.split(':');				
			for (; arrData.length > 1;) {
				var players = {};
				players.userid = arrData[0];
				players.status = arrData[1];
				response.players.push(players);
				arrData = arrData.slice(2);
			};
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password'], 
					GET_PLAYERS.format([body.userid, body.password]),
					handleResponse,
					false);		
	},
	getCard: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response) {
			var arrData = data.split(':');				
			if (arrData.length > 1) {
				response.num = arrData[0];
				response.suit = arrData[1];
			};
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password'], 
					GET_CARD.format([body.userid, body.password]),
					handleResponse,
					false);		
	},
	sendGame: function (req, res, larcClient) {
		var body = req.body;
		var handleResponse = function (data, response) {
			response.status = 'ok';
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password', 'msg'], 
					SEND_GAME.format([body.userid, body.password, body.msg]),
					handleResponse,
					true);		
	}	
};