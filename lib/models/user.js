'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * User Schema
 */
var UserSchema = new Schema({
    _id: String,
	email: String,
	roles: [{ type: String, ref: 'Role' }],
	gcm: [String],
	gcm_notification_key: String,
	expires_at: Date,
	updated_at: Date,
	created_at: Date
});

UserSchema.pre('save', function(next){
	this.updated_at = new Date;
	if ( !this.created_at ) {
		this.created_at = new Date;
	}
	next();
});

mongoose.model('User', UserSchema);