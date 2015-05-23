'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var TagSchema = new Schema({
	_id: String,
	title: String,
	description: String,
	icon: String,
	color: String,
	created_at: Date,
	updated_at: Date
});

TagSchema.pre('save', function(next){
	this.updated_at = new Date();
	if ( !this.created_at ) {
		this.created_at = new Date();
	}
	next();
});

mongoose.model('Tag', TagSchema);
