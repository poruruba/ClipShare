'use strict';

const HELPER_BASE = process.env.HELPER_BASE || "/opt/";
const Response = require(HELPER_BASE + 'response');

const APIKEY = "【任意のAPIKey】";
const EXPIRES_IN = 60 * 60 * 1000;
var clip = null;

exports.handler = async (event, context, callback) => {
	var body = JSON.parse(event.body);

	if( event.requestContext.apikeyAuth.apikey != APIKEY )
		throw "apikey invalid";

	switch(event.path){
		case "/clipshare-get":{
			if( !clip || new Date().getTime() > clip.created_at + EXPIRES_IN )
				return new Response({status: "ng"});
			return new Response({ status: "ok", clip: clip });
		}
		case "/clipshare-set":{
			clip = { 
				text: body.text,
				created_at: new Date().getTime()
			};
			return new Response({ status: "ok" } );
		}
	}
};
