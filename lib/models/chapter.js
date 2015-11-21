'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

// jshint -W106
var ChapterSchema = new Schema({
	_id: String,
	name: String,
	city: String,
	state: String,
	country: { type: String, ref: 'Country' },
	geo: { lng: Number, lat: Number },
	group_type: String,
	status: String,
	site: String,
	organizers: [{ type: String, ref: 'User' }],
	created_at: Date,
	updated_at: Date
});

ChapterSchema.pre('save', function(next){
	this.updated_at = new Date();
	if ( !this.created_at ) {
		this.created_at = new Date();
	}
	next();
});
// jshint +W106

ChapterSchema.index({ geo: '2dsphere' });

mongoose.model('Chapter', ChapterSchema);
