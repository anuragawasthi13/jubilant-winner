/**
 * @author Anurag Awasthi
 */
 
'use strict';

/**
 * Module dependencies.
 */
var express=require("express"),
	User = require("./../models/user.js"),
	router = express.Router();

router.get('/user/listing',function(req,res){
	console.log("\n-------------------------------\n");
	User.find({},function(err,data){
		if(!err && data){
			console.log("user listing success");
			res.status(200).json({
				"userListing":{
					"success":true,
					"data":data
				}
			});
		}
		else{
			console.log("user listing failure");
			res.status(200).json({
				"userListing":{
					"success":false,
					"data":"error occured"
				}
			});
			console.log("error occured",err);
		}
	});
	console.log("\n-------------------------------\n");
});

module.exports=router;