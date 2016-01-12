'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// jshint -W106
var TaskLogSchema = new Schema({
	_id: String,
	task_type: String,
	requested_by: String,
	executed_by: String,
	msg: String,
	result: Number,
	started_at: Date,
	ended_at: Date
});
// jshint +W106

mongoose.model('TaskLog', TaskLogSchema);
