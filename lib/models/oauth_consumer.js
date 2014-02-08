'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var OauthConsumerSchema = new Schema({
	name: String,
	consumer_key: { type: String, index: {unique: true}},
	consumer_secret: String,
	callback_url: String,
	required_permissions: [ String ],
	optional_permissions: [ String ],
	updated_at: Date,
	created_at: Date
});
OauthConsumerSchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});

mongoose.model('OauthConsumer', OauthConsumerSchema);