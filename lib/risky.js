'use strict';

var redis = require('redis'),
	moment = require('moment');

module.exports = function() {
	var receiver, emitter, prefix;
	var readyCount = 0;
	var myId;
	var startup;
	var self;
	var master = false;
	var cluster = {};
	var heartbeatInterval;

	var evaluateMaster = function() {
		var iAmMaster = true;
		for(var prop in cluster) {
			if(cluster[prop].started < startup) {
				iAmMaster = false;	
			}
		}

		if(!master && iAmMaster) {
			console.log("I'm the master now...");
		} else if(master && !iAmMaster) {
			console.log("I'm a slave now...");
		}
		master = iAmMaster;
	}

	var ready = function() {
		readyCount++;
		if(readyCount == 2) {
			startup = moment().valueOf();
			console.log("Risky is up. I'm "+ myId);
			self.on('group:hello', function(data) {
				if(data.sender != myId && data.type == "hi") {
					console.log(data.sender + " just said hi. Replying.");
					cluster[data.sender] = {
						started: data.started,
						nextHeartbeat: moment().valueOf()+10000
					};
					evaluateMaster();

					self.emit('group:hello', {
						sender: myId,
						type: 'hi_reply',
						started: startup
					});
				}
			});

			self.on('group:heartbeat', function(data) {
				if(data.sender != myId && cluster[data.sender]) {
					cluster[data.sender].nextHeartbeat = data.nextHeartbeat;
					if(cluster[data.sender].timeout) {
						clearTimeout(cluster[data.sender].timeout);
						cluster[data.sender].timeout = null;
					}
					var next = (data.nextHeartbeat - moment().valueOf())+2000;

					cluster[data.sender].timeout = setTimeout(function() {
						console.log(data.sender+" has gone down...");
						delete cluster[data.sender];
						evaluateMaster();
					}, next);
				}
			});

			self.on('group:taskrequest', function(data) {
				if(!master) {
					// Offer to execute task
					self.emit('group:taskoffer', {
						sender: myId
						taskId: data.taskId;
					});
				}
			});

			self.on('group:taskoffer', function(data) {
				// First one to send an offer wins
			});

			self.emit('group:hello', {
				sender: myId,
				type: 'hi',
				started: startup
			});

			var hb = function() {
				var next = moment().valueOf()+5000;
				self.emit('group:heartbeat', {
					sender: myId,
					nextHeartbeat: next
				});
			};
			heartbeatInterval = setInterval(hb, 5000);
			hb();
		}
	};

	self = {
		connect: function(options) {
			options = options || {};
			var port = options && options.port || 6379;   // 6379 is Redis' default
			var host = options && options.host || '127.0.0.1';
			var auth = options && options.auth;

			myId = options && options.id;

			emitter = redis.createClient(port, host);
		  	receiver = redis.createClient(port, host);

		  	emitter.on('ready', ready);
			receiver.on('ready', ready);

		  	if (auth) {
		  		emitter.auth(auth);
		  		receiver.auth(auth);
		  	}

		  	receiver.setMaxListeners(0);
		  	prefix = options.scope ? options.scope + ':' : '';
		},
		getRedisClient: function() {
			return emitter;
		},
		on: function(channel, handler, cb) {
			var callback = cb || function () {};

			receiver.on('pmessage', function (pattern, _channel, message) {
				if (prefix + channel === pattern) {
				  handler(JSON.parse(message));
				}
			});

			receiver.psubscribe(prefix + channel, callback);
		},
		emit: function(channel, message) {
			emitter.publish(prefix + channel, JSON.stringify(message));
		}
	};
	return self;
}();
