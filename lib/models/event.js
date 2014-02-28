'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var EventSchema = new Schema({
	_id: String,
	chapter: { type: String, ref: 'Chapter' },
	start: Date,
	end: Date,
	geo: { lng: Number, lat: Number },
	about: String,
	timezone: String,
	allDay: Boolean,
	location: String,
	title: String,
	iconUrl: String,
	eventUrl: String,
	tags: [String],
	created_at: Date,
	updated_at: Date
});

EventSchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});

EventSchema.index({ geo: '2dsphere' });

mongoose.model('Event', EventSchema);
