var express = require('express');
var mongoose = require('mongoose');
var User = require("./../models/user.js");
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/register', function(req, res) {
    res.render('register');
});
router.get('/login', function(req, res) {
    res.render('login');
});
router.post('/register', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    console.log(req.body);
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('register', {
            errors: errors
        });
    } else {
        console.log("everything's ok");
        var user = new User(req.body);
        User.ensureUniqueUserName(req.body.username, function(success) {
            if (success) {
                User.createUser(user, function(err, user) {
                    if (err) throw err;
                    console.log("user saved", user);
                    req.flash("success_msg", "You are registered and can now login");
                    res.redirect('/users/login');
                });
            } else {
                res.render('register', {
                    errors: [{ param: 'notuniqueusername', msg: 'Username is already in use', value: '' }]
                });
            }
        });
    }
    //res.status(200).send("your actions are heard");
});



passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid Password'
                    });
                }
            });
        })
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function(req, res) {
        res.redirect('/');
    });

router.get('/logout', function(req, res) {
    console.log("user logged out");
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});
module.exports = router;