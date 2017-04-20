var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'./uploads'});
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register',{title:'register'});
});

router.get('/login', function(req, res, next) {
  res.render('login',{title:'login'});
});



router.post('/login',
	passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:'Invalid username or passowrd'}),
      function(req, res){
      	req.flash('success', 'You are now logged in');
      	res.redirect('/');
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(function(uesrname, passowrd, done){
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;

		if(!user){
			return done(null, false, {message: Invalid username});
		}
		User.comparePassword(password, function(err, isMatch){
			if(err){
				return done(err);
			}
			if(isMatch){
                return done(null, user);
			} else{
				return done(null, false, {message: Invalid passowrd});
			}
		})
	})
}))



passport.use(new LocalStrategy(function(username, password, done){
	User.getUserByUsername(username, function(err, user){
		if(err) throw err;
		if(!user){
			return done(null, false, {message: 'Invalid Username'});
		}
		User.comparePassword(password, user.password, function(err, isMatch){
			if(err) return done(err);
			if(isMatch){
				return done(null, user);
			} else{
				return done(null, false, {message: 'Invalid passowrd'});
			}
		})
	})
}))



router.post('/register', upload.single('profileimage'),function(req, res){
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

    if(req.file){
    	console.log('uploading file...')
       var profileimage = req.file.filename;

    }else{
    	console.log('No file uploded');
    	var profileimage = 'noimage.jpg';
    }


    // form validator
    req.checkBody('name', 'Name filed is required').notEmpty();
    req.checkBody('email', 'Email filed is required').notEmpty();
    req.checkBody('email', 'Email filed is not valid').isEmail();
    req.checkBody('username', 'Username filed is required').notEmpty();
    req.checkBody('password', 'Password filed is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);

    // check errors
    var errors =req.validationErrors();

    if(errors){
    	res.render('register', {
    		errors: errors
    	})
    }else{
    	
    	var newUser = new User({
    		name: name,
    		email: email,
    		username: username,
    		password: password,
    		profileimage: profileimage
    	});

    	User.createUser(newUser, function(err, user){
    		if(err) throw err
    			console.log(user);
    	});

    	req.flash('success', 'You are successfully registered and can login');

    	res.location('/');
    	res.redirect('/');
    }

});


router.get('/logout', function(req, res){
	req.logout();
	req.flash('success', 'You are now loggetout');
	res.redirect('/users/login');
})

module.exports = router;
