const GET_USERS = 'GET USERS {0}:{1}';

var validateParams = function (req, res, params) {
	console.log('params:');
	console.log(params);
	var p = '';
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
	console.log('Requisição recebida: ');
	console.log(body);
	if (!validateParams(req, res, params)) {
		return;
	};

	var handler = function(data, client) {
		var response = {};
		response.userid = body.userid;		
		var strData = data.toString('utf8');
		handleResponse(strData, response);
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);
	};

	var sendRequest = function (client) {
		console.log('Requisição enviada: ' + request)
		client.write(request);		
	};	

	if (udp) {	
		larcClient.sendUDP(body.userid, req, res, handler, sendRequest);
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
		};

		handleRequest(req, res, larcClient, 
					['userid', 'password'], 
					GET_USERS.format([body.userid, body.password]),
					handleResponse,
					false);		
	}
};