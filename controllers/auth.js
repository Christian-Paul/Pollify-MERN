var router = require('express').Router();
var config = require('../config');

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
		if (err) {
			res.status(500).send(err);
		}
		else {
			twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
				if (err)
					res.status(500).send(err);
				else {
					req.session.userInfo = user;
					req.session.save(function(err) {
						if(err) {
							console.log(err);
						} 
						res.redirect('/')
					})
				}
			});
		}
	});
});

// sign out: destroy session
router.get('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if(err) {
			console.log(err);
		} else {
			res.send('signed out');
		}
	})
});

// check if user is authenticated
router.get('/check-auth', function(req, res) {
	var data = {
		logged: req.session.userInfo !== undefined,
		userInfo: req.session.userInfo
	};

	res.send(data);
});

module.exports = router;