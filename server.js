var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
//var larcClient = require('./larc-client-mock.js');
var larcClient = require('./larc-client.js');
var larcAPI = require('./larc-api.js');
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

var server = app.listen(1012, function () {
   var host = server.address().address;
   var port = server.address().port;
   console.log('Listening at http://%s:%s', host, port)
});

app.get('/', function(req, res) {
    res.sendFile(path.join(path.join(__dirname, '/public/index.html')));
});

app.use('/',express.static(path.join(__dirname, 'public')));
app.use('/lib',express.static(path.join(__dirname, 'bower_components')));

app.post("/getusers", function(req, res) {
	larcAPI.getUsers(req, res, larcClient);
});

app.post("/getmessage", function(req, res) {
	larcAPI.getMessage(req, res, larcClient);
});

app.post("/sendmessage", function(req, res) {
	larcAPI.sendMessage(req, res, larcClient);
});

app.post("/getplayers", function(req, res) {
	larcAPI.getPlayers(req, res, larcClient);
});

app.post("/getcard", function(req, res) {
	larcAPI.getCard(req, res, larcClient);
});

app.post("/sendgame", function(req, res) {
	larcAPI.sendGame(req, res, larcClient);
});