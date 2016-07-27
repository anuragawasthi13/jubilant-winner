/**
var express = require('express');
var router = express.Router();
var User = require("./../models/user.js");
var Image = require("./../models/image.js");
var Puid = require('puid');
var path = require('path');
var img_mod_timeout = 2000;
router.post('/user/listing', function(req, res) {
	User.find({},function(err,data){
		if(!err){
			console.log(data);
			req.json({
				"userListing":{
					"success":true,
					"msg":data
				}
			});
		} else{
			console.log("error occured",err);
			res.json({
				"userListing":{
					"success":false,
					"msg":"failure occured"
				}
			});
		}
	})
});
**/