'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var EventExtensionSchema = new Schema({
	_id: String,
	event: { type: String, ref: 'Event' },
	extensions: [{
	  key: String,
	  value: String
	}],
	created_at: Date,
	updated_at: Date
});

EventExtensionSchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});


mongoose.model('EventExtension', EventExtensionSchema);