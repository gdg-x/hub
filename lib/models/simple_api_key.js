'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SimpleApiKeySchema = new Schema({
	application: { type: String, ref: 'Application' },
	api_key: { type: String, index: {unique: true}},
	updated_at: Date,
	created_at: Date
});
SimpleApiKeySchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});

mongoose.model('SimpleApiKey', SimpleApiKeySchema);