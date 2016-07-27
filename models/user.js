'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcryptjs'),
	chalk = require('chalk'); //64-bit encode for tips comment
var UserSchema = new Schema({
	username: {
		type: String
	},
	name: {
		type: String
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	myimages:{
		type:Array,
		default:[]
	}

});

var User = module.exports = mongoose.model('User', UserSchema);
module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		})
	})
}

module.exports.getUserByUsername = function(username, callback) {
	var query = {
		username: username
	};
	User.findOne(query, callback);
}
module.exports.comparePassword = function(candPassword, hashPassword, callback) {
	bcrypt.compare(candPassword, hashPassword, function(err, isMatch) {
		if (err) throw err;
		callback(null, isMatch);
	});
}
module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
}
module.exports.ensureUniqueUserName = function(username, fn) {
	var query = {
		username: username
	};
	User.find(query, function(err, data) {
		console.log("data is:", data);
		if (!err && data) {
			if (data != null && data.length > 0) {
				console.log("Found duplicate username");
				fn(false);
			} else if (data.length == 0) {
				console.log(chalk.red("unique username"));
				fn(true);
			}
		} else {
			if (err) {
				console.log(chalk.red(err));
				fn(false);
			}

		}
	})
}