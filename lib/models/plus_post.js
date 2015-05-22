'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PlusPostSchema = new Schema({
	_id: String,
	chapter: { type: String, ref: 'Chapter' },
	share: {
		id: { type: String, ref: 'PlusPost' },
		url: String,
		author: String,
		name : String
	},
	title: String,
	url: String,
	hashtags: [String],
	images: [String],
	published_at: Date,
	created_at: Date,
	updated_at: Date
});

PlusPostSchema.pre('save', function(next){
	this.updated_at = new Date();
	if ( !this.created_at ) {
		this.created_at = new Date();
	}
	next();
});

mongoose.model('PlusPost', PlusPostSchema);
