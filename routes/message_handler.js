'use strict';

var Message = require("./../models/message.js");

module.exports.save_new_message = function(data) {
	console.log("---------------loginapp----------------");
	console.log("\n");
	console.log("saving new message");
	console.log("\n");
	var message = new Message();
	message.sender = data.sender;
	message.receiver = data.receiver;
	message.body = data.message;
	message.save(function(err) {
		if (!err) {
			console.log("new message is saved");
		}
	});
}

module.exports.get_all_messages = function(curr_user, receiver_user, fn) {
	console.log("---------------loginapp----------------");
	console.log("getting all message between " + curr_user + " and " + receiver_user);
	Message.find({
		sender: {
			'$in': [curr_user,receiver_user]
		},
		receiver:{
			'$in': [curr_user,receiver_user]
		}
	}).lean().exec(function(err, data) {
		if (!err) {
			console.log("success in retreiving all messages",data);
			fn(true, data);
		} else {
			fn(false, "error");
		}
	})
}