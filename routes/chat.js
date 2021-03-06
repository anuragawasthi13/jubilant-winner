var express=require("express");
var router=express.Router();

router.get('/',ensureAuthentication,function(req,res){
	res.render('chat',{user:req.user});
})
function ensureAuthentication(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		req.flash('error_msg', "You are not logged in");
		res.redirect('/users/login');
	}
}
module.exports=router;