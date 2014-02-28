'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DailyMetricSchema = new Schema({
	type: String,
	year: Number,
	month: Number,
	subject: String,
	subjectType: String,
	numSamples: { type: Number, default: 0 },
	totalSamples: { type: Number, default: 0 },
	values: {
		1: { type: Number, default: 0 },
		2: { type: Number, default: 0 },
		3: { type: Number, default: 0 },
		4: { type: Number, default: 0 },
		5: { type: Number, default: 0 },
		6: { type: Number, default: 0 },
		7: { type: Number, default: 0 },
		8: { type: Number, default: 0 },
		9: { type: Number, default: 0 },
		10: { type: Number, default: 0 },
		11: { type: Number, default: 0 },
		12: { type: Number, default: 0 },
		13: { type: Number, default: 0 },
		14: { type: Number, default: 0 },
		15: { type: Number, default: 0 },
		16: { type: Number, default: 0 },
		17: { type: Number, default: 0 },
		18: { type: Number, default: 0 },
		19: { type: Number, default: 0 },
		20: { type: Number, default: 0 },
		21: { type: Number, default: 0 },
		22: { type: Number, default: 0 },
		23: { type: Number, default: 0 },
		24: { type: Number, default: 0 },
		25: { type: Number, default: 0 },
		26: { type: Number, default: 0 },
		27: { type: Number, default: 0 },
		28: { type: Number, default: 0 },
		29: { type: Number, default: 0 },
		30: { type: Number, default: 0 },
		31: { type: Number, default: 0 }
	}
});

DailyMetricSchema.index({ subject: 1, type: 1, year: -1, month: -1 });

mongoose.model('DailyMetric', DailyMetricSchema);