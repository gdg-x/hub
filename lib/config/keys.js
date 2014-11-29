'use strict';

module.exports = {
	keys: {
		google: {
			simpleApiKey: process.env.GOOGLE_SIMPLE_API_KEY || "",
			oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
			oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || ""
		},
		newrelic: {
			licenseKey: "" 
		}
	}
}

process.env.NEWRELIC_AGENT = module.exports.keys.newrelic.licenseKey;