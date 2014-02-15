'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var ApplicationSchema = new Schema({
	name: String,
	homepage: String,
	logo: String,
	user: { type: String, ref: 'User' },
	updated_at: Date,
	created_at: Date
});
ApplicationSchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});

mongoose.model('Application', ApplicationSchema);