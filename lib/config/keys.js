'use strict';

module.exports = {
	keys: {
		google: {
			simpleApiKey: "",
			oauthClientId: "",
			oauthClientSecret: ""
		},
		newrelic: {
			licenseKey: "" 
		}
	}
}

process.env.NEWRELIC_AGENT = module.exports.keys.newrelic.licenseKey;