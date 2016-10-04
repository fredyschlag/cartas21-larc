var express = require('express');
var bodyParser = require('body-parser')
var larc = require('./larc-client.js')
var app = express();

String.prototype.format = function (args) {
	var str = this;
	return str.replace(String.prototype.format.regex, function(item) {
		var intVal = parseInt(item.substring(1, item.length - 1));
		var replace;
		if (intVal >= 0) {
			replace = args[intVal];
		} else if (intVal === -1) {
			replace = "{";
		} else if (intVal === -2) {
			replace = "}";
		} else {
			replace = "";
		}
		return replace;
	});
};

String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const GET_USERS = 'GET USERS {0}:{1}';
const GET_MESSAGE = 'GET MESSAGE {0}:{1}';
const SEND_MESSAGE = 'SEND MESSAGE {0}:{1}:{2}:{3}';

const GET_PLAYERS = 'GET PLAYERS {0}:{1}';
const GET_CARD = 'GET PLAYERS {0}:{1}';
const SEND_GAME = 'SEND GAME {0}:{1}:{2}';

var server = app.listen(1012, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Listening at http://%s:%s', host, port)
});

app.post("/users", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	var handleGetUsers = function(data, client) {
		var response = {};
		response.userid = body.userid;
		response.users = [];
		var strData = data.toString('utf8');
		var arrData = strData.split(':');				
		for (; arrData.length > 1;) {
			var user = {};
			user.userid = arrData[0];
			user.username = arrData[1];
			user.wins = arrData[2];		
			response.users.push(user);
			arrData = arrData.slice(3);
		};
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);	
	};

	var sendGetUsers = function (client) {
		var sendStr = GET_USERS.format([body.userid, body.password]);
		console.log('Requisição enviada: ' + sendStr)
		client.write(sendStr);		
	};	

	larc.sendTCP(body.userid, req, res, handleGetUsers, sendGetUsers); 	
});

app.post("/getmessage", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	var handleGetMessage = function(data, client) {
		var response = {};
		response.userid = body.userid;		
		response.messages = []; 
		var strData = data.toString('utf8');
		var arrData = strData.split(':');				
		if (arrData.length > 1) {
			var message = {};
			message.userid = arrData[0];
			message.msg = arrData.slice(1).join(':');
			response.messages.push(message);
		};
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);	
	};

	var sendGetMessage = function (client) {
		var sendStr = GET_MESSAGE.format([body.userid, body.password]);
		console.log('Requisição enviada: ' + sendStr)
		client.write(sendStr);		
	};	

	larc.sendTCP(body.userid, req, res, handleGetMessage, sendGetMessage); 	
});

app.post("/sendmessage", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	if (!body.targetuserid) {
		res.status(500).send({ error: 'Id do destinatário não informado.' } );
		return;
	};
	
	if (!body.msg) {
		res.status(500).send({ error: 'Mensagem não informada.' } );
		return;
	};	

	var handleSendMessage = function(data, client) {
		var response = { status: 'ok' };		
		console.log('handleSendMessage.data: ');
		console.log(data);
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);	
	};	

	var sendStr = SEND_MESSAGE.format([body.userid, body.password, body.targetuserid, body.msg]);
	console.log('Requisição enviada: ' + sendStr);
	larc.sendUDP(body.userid, req, res, handleSendMessage, sendStr);
});

app.post("/players", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	var handleGetPlayers = function(data, client) {
		var response = {};
		response.userid = body.userid;
		response.players = [];
		var strData = data.toString('utf8');
		var arrData = strData.split(':');				
		for (; arrData.length > 1;) {
			var players = {};
			players.userid = arrData[0];
			players.status = arrData[1];
			response.players.push(players);
			arrData = arrData.slice(2);
		};
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);
	};

	var sendGetPlayers = function (client) {
		var sendStr = GET_PLAYERS.format([body.userid, body.password]);
		console.log('Requisição enviada: ' + sendStr)
		client.write(sendStr);		
	};	

	larc.sendTCP(body.userid, req, res, handleGetPlayers, sendGetPlayers); 	
});

app.post("/card", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	var handleGetCard = function(data, client) {
		var response = {};
		response.userid = body.userid;		
		var strData = data.toString('utf8');
		var arrData = strData.split(':');				
		if (arrData.length > 1) {
			response.num = arrData[0];
			response.suit = arrData[1];
		};
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);	
	};

	var sendGetCard = function (client) {
		var sendStr = GET_CARD.format([body.userid, body.password]);
		console.log('Requisição enviada: ' + sendStr)
		client.write(sendStr);		
	};	

	larc.sendTCP(body.userid, req, res, handleGetCard, sendGetCard); 	
});

app.post("/sendgame", function(req, res) {
	var body = req.body;
	console.log('Requisição recebida: ');
	console.log(body);
	if (!body.userid) {
		res.status(500).send({ error: 'Id não informado.' } );
		return;
	};
	
	if (!body.password) {
		res.status(500).send({ error: 'Senha não informada.' } );
		return;
	};

	if (!body.msg) {
		res.status(500).send({ error: 'Mensagem não informada.' } );
		return;
	};	

	var handleSendGame = function(data, client) {
		var response = { status: 'ok' };		
		console.log('handleSendGame.data: ');
		console.log(data);
		console.log('Resposta: ');
		console.log(response);
		client.res.send(response);	
	};	

	var sendStr = SEND_GAME.format([body.userid, body.password, body.msg]);
	console.log('Requisição enviada: ' + sendStr);
	larc.sendUDP(body.userid, req, res, handleSendGame, sendStr);
});