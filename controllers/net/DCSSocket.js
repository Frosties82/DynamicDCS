const net = require('net');
const _ = require('lodash');
const dbMapServiceController = require('../db/dbMapService'); // reqclientArray, reggameGuiArray

exports.createSocket = function (serverName, address, port, queName, callback) {
	var sock = this;
	var sockConn;
	_.set(sock, 'cQue', []);
	_.set(sock, 'serverName', serverName);
	_.set(sock, 'connOpen', true);
	_.set(sock, 'buffer', {});
	_.set(sock, 'startTime', new Date().valueOf() );
	_.set(sock, 'sessionName', serverName+'_'+sock.startTime+' ' + queName + ' Node Server Starttime');

	setInterval(function () { //sending FULL SPEED AHEAD, 1 per milsec (watch for weird errors, etc)
		if (sock.cQue.length < 5) {
			dbMapServiceController.cmdQueActions('grabNextQue', serverName, {queName: queName})
				.then(function (resp) {
					if (resp) {
						sock.cQue.push(resp.actionObj);
					}
				})
				.catch(function (err) {
					console.log('erroring line34: ', err);
				})
			;
		}
	}, 100);

	sock.connSocket = function () {
		sockConn = net.createConnection({
			host: address,
			port: port
		}, function () {
			var time = new Date();
			console.log('Connected to DCS Client at '+address+':'+port+' !');
			_.set(sock, 'connOpen', false);
			sock.buffer = [];
		});
		sockConn.on('connect', function () {
			sock.startTime = new Date().valueOf() ;
			sock.sessionName = serverName+'_'+sock.startTime;
			sockConn.write('{"action":"NONE"}' + "\n");
		});

		sockConn.on('data', function (data) {
			sock.buffer += data;
			while ((i = sock.buffer.indexOf("\n")) >= 0) {
				var curStr;
				var nextInst;
				var strJson;
				var isValidJSON = true;
				var subStr = sock.buffer.substring(0, i);
				try { JSON.parse(subStr) } catch(e) { isValidJSON = false }
				if (isValidJSON) {
					curStr = JSON.parse(subStr);
				} else {
					curStr = '{}';
					console.log('bad substring: ', subStr);
				}
				callback(serverName, curStr);
				sock.buffer = sock.buffer.substring(i + 1);
				nextInst = _.get(sock, ['cQue', 0]);
				strJson = (JSON.stringify(nextInst)) ? JSON.stringify(nextInst) : '{"action":"NONE"}' ;
				sockConn.write( strJson + "\n");
				if (nextInst) {
					sock.cQue.shift();
				}
			}
		});

		sockConn.on('close', function () {
			time = new Date();
			console.log(' Reconnecting DCS Client on '+ address +':'+port+'....');
			_.set(sock, 'connOpen', true);
		});

		sockConn.on('error', function (err) {
			_.set(sock, 'connOpen', true);
			console.log('Client Error: ', err);
		});
	};
};