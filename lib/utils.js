'use strict';

var crypto = require('crypto'),
	request = require('superagent'),
	forge = require('node-forge');

module.exports = {
	base64urlDecode: function(str) {
		return new Buffer(this.base64urlUnescape(str), 'base64').toString();
	},

	base64urlUnescape: function(str) {
		str += new Array(5 - str.length % 4).join('=');
		return str.replace(/\-/g, '+').replace(/_/g, '/');
	},

	decodeAndVerifyJwt: function(jwt, pubKey, callback) {
		var verifier = crypto.createVerify("RSA-SHA256"),
			contents = [],
			header = "",
			claimSet = "",
			signature = "",
			data = "",
			matches = false;

		// Convert JWT to an array of 3 parts.
		contents = jwt.split(".");

		if (!Array.isArray(contents)) { contents = [ contents ]; }

		if(contents.length != 3) {
			if(callback) callback(new Error("Invalid JWT length"), null);
		}

		header = this.base64urlDecode(contents[0]);
		claimSet = this.base64urlDecode(contents[1]);
		signature = this.base64urlUnescape(contents[2]);
		data = contents[0] + "." + contents[1];

		if (header && claimSet && signature) {
			// These come in as a strings, parse them to an object and then convert it into a clean string.
			header = JSON.parse(header);
			claimSet = JSON.parse(claimSet);

			// HMAC cannot be verified without the private key used to recompute the signature. I consider
			// this less secure for a client/server setup where the server only needs to stores a public key.
			// To use HMAC, the next two lines would need to be changed to use the private key to
			// recompute the signature and check it against the JWT's signature.
			// e.g. signature = base64urlEscape(crypto.createHmac('sha256', privKey).update(data).digest('base64'));
			verifier.update(data);
			matches = verifier.verify(pubKey[header.kid].rawCert, signature, 'base64');
			if(matches) {
				if(callback) callback(null, claimSet);
			}

		} else if(callback) callback(new Error("Invalid JWT"), null);
	},

	getGoogleCert: function(callback) {
		var me = this;
		var now = new Date();

		if(this.googleCert) {
			var valid = 0;
			for(var prop in this.googleCert){
				var cert = this.googleCert[prop];

				if(now > cert.starts && now < cert.expires)
					valid++;
			}

			if(valid > 0) {
				callback(this.googleCert);
				return;
			}
		}

		request.get("https://www.googleapis.com/oauth2/v1/certs", function(err, res) {
			me.googleCert = {}
			for(var prop in res.body){
				var rawCert = res.body[prop];

				var cert = forge.pki.certificateFromPem(rawCert)
				me.googleCert[prop] = {
					rawCert: rawCert,
					valid_from: cert.notBefore,
					valid_to: cert.notAfter
				};
			}
			if(callback) callback(me.googleCert);
		});
	}
}