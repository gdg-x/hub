'use strict';

var redis = require('redis'),
	mongoose = require('mongoose'),
	TaskLog = mongoose.model('TaskLog'),
	uuid = require('node-uuid'),
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

	var taskHandler = {};
	var tasks = {};

	var evaluateMaster = function() {
		var iAmMaster = true;
		for(var prop in cluster) {
			if(cluster[prop].started < startup) {
				iAmMaster = false;	
			}
		}

		console.log("was master: "+ master+", now master: "+iAmMaster);

		master = iAmMaster;
	}

	var taskDone = function(id, type, started, executor, err, result, cb) {
		var ended = moment().valueOf();
		var elapsed = ended - started;

		var logentry = new TaskLog();
		logentry._id = id;
		logentry.task_type = type;
		logentry.started_at = moment(started);
		logentry.ended_at = ended;
		logentry.requested_by = myId;
		logentry.executed_by = executor;

		if(err) {
			logentry.result = 1;
			logentry.msg = JSON.stringify(err);
		} else {
			logentry.result = 0;
		}
		logentry.save();

		if(tasks[id])
			delete tasks[id];

		cb(err, result, elapsed);
	}

	var responder;

	var ready = function() {
		readyCount++;
		if(readyCount == 2) {
			startup = moment().valueOf();
			console.log("Risky is up. I'm "+ myId);
			self.on('group:hello', function(data) {
				if(data.sender != myId && data.type == "hi") {
					if(responder) {
						console.log("Cancel masterResponder")
						clearTimeout(responder);
						responder = null;
					}

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
				} else if(data.sender != myId && data.type == "hi_reply") {
					if(responder) {
						console.log("Cancel masterResponder")
						clearTimeout(responder);
						responder = null;
					}

					cluster[data.sender] = {
						started: data.started,
						nextHeartbeat: moment().valueOf()+10000
					};
					evaluateMaster();
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
					if(taskHandler[data.type]) {
						// Offer to execute task
						console.log("Offering to execute task with type: "+ data.type);
						self.emit('group:taskoffer', {
							sender: myId,
							type: data.type,
							id: data.taskId
						});
					} else {
						console.log("Don't know how to execute task");
					}
				} else {
					console.log("I'm the master, not doing any tasks");
				}
			});

			self.on('group:taskoffer', function(data) {
				// First one to send an offer wins
				if(tasks[data.id] && tasks[data.id].state == "open") {
					tasks[data.id].state = "executing"
					tasks[data.id].executor = data.sender;

					tasks[data.id].acceptCallback(data.id, data.type, moment());

					self.emit('group:taskstart', {
						sender: myId,
						type: data.type,
						recipient: data.sender,
						params: tasks[data.id].params,
						id: data.id
					})
				}
			});

			self.on('group:taskstart', function(data) {
				if(data.recipient == myId) {
					console.log("Executing task... type: "+ data.type + ", id: "+ data.id);
					taskHandler[data.type](data.id, data.params, function(err, result) {
						self.emit('group:taskdone', {
							sender: myId,
							type: data.type,
							recipient: data.sender,
							err: err,
							result: result,
							id: data.id
						});
					});
				}
			});

			self.on('group:taskdone', function(data) {
				if(tasks[data.id] && tasks[data.id].executor == data.sender) {
					// Task got executed
					taskDone(data.id, data.type, tasks[data.id].started, tasks[data.id].executor, data.err, data.result, tasks[data.id].cb);
				}
			});

			self.emit('group:hello', {
				sender: myId,
				type: 'hi',
				started: startup
			});
			responder = setTimeout(function() {
				evaluateMaster();
			}, 4000);

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
		getCluster: function() {
			return cluster;
		},
		setTaskHandler: function(taskType, handler) {
			taskHandler[taskType] = handler;
		},
		sendTask: function(taskType, params, acceptCallback, cb, force) {
			cb = cb || function() {};
			acceptCallback = acceptCallback || function() {};

			params = params || {};
			force = force != undefined ? force : false;

			var id = uuid.v4();
			if((master || force) && Object.keys(cluster).length > 0) {
				console.log("Sending out task "+ taskType + " with id "+ id);
				tasks[id] = {
					type: taskType,
					started: moment().valueOf(),
					state: "open",
					params: params,
					acceptCallback: acceptCallback,
					cb: cb
				};

				self.emit('group:taskrequest', {
					type: taskType,
					from: myId,
					taskId: id
				});
			} else if(Object.keys(cluster).length == 0 && taskHandler[taskType]) {
				console.log("Doing task myself...");
				acceptCallback(id, taskType, moment());
				var started = moment().valueOf();
				taskHandler[taskType](id, params, function(err, result) {
					taskDone(id, taskType, started, myId, err, result, cb);
				});
			} else {
				console.log("Not doing it...");
			}
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
