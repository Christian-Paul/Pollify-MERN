var express = require('express');
var router = express.Router();
var config = require('../config');
var Poll = require('../models/poll.js');

router.use('/poll', require('./poll.js'));

// sends index page for react to build off of; all other routes are apis to support the react routes
router.get('/', function(req, res) {
	res.sendFile('index.html', { root: 'src' });
});

var Twitter = require('node-twitter-api');

var twitter = new Twitter({
	consumerKey: config.consumerKey,
	consumerSecret: config.consumerSecret,
	callback: config.callbackUrl
});

var _requestSecret;

// when a user clicks 'sign in' get a request token from twitter and redirect user to sign in with token
router.get('/request-token', function(req, res) {
	twitter.getRequestToken(function(err, requestToken, requestSecret) {
		if(err) {
			res.status(500).send(err);
		} else {
			_requestSecret = requestSecret;
			res.send('https://api.twitter.com/oauth/authenticate?oauth_token=' + requestToken);
		}
	});
});

// when user is sent back from twitter, use results to obtain credentials
router.get('/login/twitter/callback', function(req, res) {
	var requestToken = req.query.oauth_token;
	var verifier = req.query.oauth_verifier;

    twitter.getAccessToken(requestToken, _requestSecret, verifier, function(err, accessToken, accessSecret) {
        if (err)
            res.status(500).send(err);
        else
            twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
                if (err)
                    res.status(500).send(err);
                else {
                	req.session.userInfo = user;
                	req.session.save(function(err) {
                		if(err) {
                			console.log(err);
                		} else {
                			res.redirect('/');
                		}
                	});
                }
            });
    });
});

// sign out: destroy session and clear cookies
router.get('/sign-out', function(req, res) {
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.clearCookie(sessionOptions.name);
			res.send('signed out');
		}
	})
});

// check if user is authenticated
router.get('/check-auth', function(req, res) {
	if(req.hasOwnProperty('session') && req.session.hasOwnProperty('userInfo')) {
		res.send(req.session.userInfo);
	} else {
		res.send('not authenticated');
	}
});


// get polls by user id
router.get('/user/:userId', function(req, res) {
	Poll.getByAuthorId(req.params.userId, function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	})
});

module.exports = router;