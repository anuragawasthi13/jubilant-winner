'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var MessageSchema = new Schema({
	sent:{
		type:Date,
		default:Date.now
	},
	sender:{
		type:String
	},
	receiver:{
		type:String
	},
	body:{
		type:String
	}
});

var Message=module.exports=mongoose.model('Message', MessageSchema);