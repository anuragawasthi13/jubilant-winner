var express = require('express');
var router = express.Router();
var User = require("./../models/user.js");
var Image = require("./../models/image.js");
var jimp = require('jimp');
var Puid = require('puid');
var path = require('path');
var img_mod_timeout = 2000;
router.get('/', ensureAuthentication, function(req, res) {
	res.render('index');
});

function ensureAuthentication(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', "You are not logged in");
		res.redirect('/users/login');
	}
}

function compressAndResize(imageUrl) {
	console.log("app controller: utipsphoto :: compressAndResize");

	console.log(path.resolve(__dirname, './../public/images/320/' + path.basename(imageUrl)));

	jimp.read(imageUrl, function(err, image) {
		console.log("app controller: utipsphoto :: compressAndResize image processing started");

		if (!err && image) {

			setTimeout(function() {
				image.resize(320, 320).quality(100).write(path.resolve(__dirname, './../public/images/320/' + path.basename(imageUrl)));
			}, 2000);

			setTimeout(function() {
				image.resize(640, 320).quality(100).write(path.resolve(__dirname, './../public/images/640/' + path.basename(imageUrl)));
			}, 2000);
			setTimeout(function() {
				image.resize(200, 200).quality(100).write(path.resolve(__dirname, './../public/images/200/' + path.basename(imageUrl)));
			}, 2000);

			console.log("app controller: utipsphoto :: compressAndResize  image processing completed");
		} else {
			console.log("------------jimp error-------");
			console.log(err);
			console.log(imageUrl);
			console.log("------------jimp error-------");
		}
	});
}

function assignImageToUser(userId, image_object) {
	User.findById(userId, function(err, data) {
		if (!err && data) {
			data.myimages.push(image_object);
			data.save(function(err2) {
				if (!err2) {
					console.log("updated user data");
				} else {
					console.log("error in upadating user data", err2);
				}
			});
		} else {
			console.log("error in finding user data");
		}
	})
}

function doImgProcessing(image_object) {
	console.log("app controller: utipsphoto :: doImgProcessing");

	setTimeout(function() {
		var imgUrl = image_object.image_url;
		var imgId = image_object.imgId;
		compressAndResize(imgUrl);
		console.log(imgUrl + "      " + imgId);
	}, img_mod_timeout);
}


router.post('/fileupload', ensureAuthentication, function(req, res) {
	console.log("\n\n\n");
	console.log("this is the req body");
	console.log(req.body);
	console.log("\n\n\n");
	console.log("this is the req file");
	console.log(req.file);
	if (req.file == undefined) {
		res.redirect('/');
	} else {
		var image = new Image();
		image.imgInfo = {
			"type": req.file.mimetype,
			"oname": req.file.originalname,
			"name": req.file.name,
			"extension": req.file.extension
		};
		var puid = new Puid();
		image.imgId = puid.generate();
		console.log("app controller: utipsphoto :: imgId generated " + image.imgId);
		image.imgUrl = image.imgUrl + req.file.filename;
		image.imgUrlLarge = image.imgUrlLarge + req.file.filename;
		image.imgUrlSmall = image.imgUrlSmall + req.file.filename;
		image.imgUrlXSmall = image.imgUrlXSmall + req.file.filename;
		var image_object = {
			"image_url": image.imgUrl,
			"image_url_small": image.imgUrlSmall,
			"image_url_xsmall": image.imgUrlXSmall,
			"image_url_large": image.imgUrlLarge,
			"imgId": image.imgId
		};
		image.save(function(err) {
			console.log("app controller: utipsphoto :: img save");
			if (err) {
				console.log("app controller: utipsphoto :: img save error", err);
			} else {
				console.log("app controller: utipsphoto :: img save success");
				doImgProcessing(image_object);

			}
		});
		console.log("-------saveImage End------------");
		assignImageToUser(req.user._id, image_object);

		setTimeout(function() {
			req.flash("success_msg", "file is uploaded");
			res.redirect('/');
		}, 3000);
	}



});
module.exports = router;