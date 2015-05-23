'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var GdeSchema = new Schema({
	_id: String,
	name: String,
	location: String,
	country: { type: String, ref: 'Country' },
	geo: { lng: Number, lat: Number },
	email: String,
	products: [String],
	product_codes: [String],
	active: Boolean,
	created_at: Date,
	updated_at: Date
});

GdeSchema.pre('save', function(next){
	this.updated_at = new Date();
	if ( !this.created_at ) {
		this.created_at = new Date();
	}
	next();
});

GdeSchema.index({ geo: '2dsphere' });

mongoose.model('Gde', GdeSchema);
