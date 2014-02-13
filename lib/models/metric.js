'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MetricSchema = new Schema({
	type: String,
	timestamp: Date,
	chapter: { type: String, ref: 'Chapter' },
	numSamples: { type: Number, default: 0 },
	totalSamples: { type: Number, default: 0 },
	values: {
		1: { type: Number, default: 0 },
		2: { type: Number, default: 0 },
		3: { type: Number, default: 0 },
		4: { type: Number, default: 0 },
		5: { type: Number, default: 0 },
		6: { type: Number, default: 0 },
		7: { type: Number, default: 0 }
	}
});

MetricSchema.index({ type: 1, timestamp: -1 });

mongoose.model('Metric', MetricSchema);