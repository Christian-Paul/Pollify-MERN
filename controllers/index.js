var express = require('express');
var router = express.Router();
var config = require('../config');
var Poll = require('../models/poll.js');

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


// get recent polls
router.get('/recent-polls', function(req, res) {
	Poll.getRecent(function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	});
});


// get polls by user id
router.get('/user-polls/:tagId', function(req, res) {
	Poll.getByAuthorId(req.params.tagId, function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	})
});

// get poll by poll id
router.get('/polls/:tagId', function(req, res) {
	Poll.getById(req.params.tagId, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(result));
		}
	});
});

// process a vote
router.get('/vote', function(req, res) {

	// the number corresponding to the user's vote
	var userChoice = req.query.vote;

	// building a property name to pass to the update field
	// object will look like $inc: { options.2.votes: 1 }
	// to denote the option at index 2 is being incremented by 1
	var locationString = 'options.' + userChoice + '.votes';
	var updateObj = {};
	updateObj[locationString] = 1;

	Poll.addVote(req.query.pollId, req.session, req.ip, updateObj, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			if(result.result === 'fail') {
				res.send({
					result: 'fail',
					message: 'This account or IP address has already voted'
				})
			} else {
				res.send({
					result: 'success',
					message: 'Vote casted for: ' + result.options[userChoice].name,
					pollOptions: result.options
				});
			}
		}
	});
});

// add a new option to a poll
router.get('/add-option', function(req, res) {
	Poll.addNewOption(req.query.newOption, req.query.pollId, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			res.send({
				result: 'success',
				pollOptions: result.options
			});
		}
	});
});

// delete a poll
router.get('/delete-poll', function(req, res) {
	Poll.deleteById(req.query.pollId, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			res.send({
				result: 'success',
				pollOptions: result.options
			});
		}
	})
});

router.post('/create-poll', function(req, res) {
	var formData = req.body;

	// title is first item in array, formDataArr now contains only options
	var title = formData.pollTitle;

	// check to see if title ends in question mark, if it doesn't, add it
	if(title.lastIndexOf('?') !== (title.length - 1)) {
		title = title.concat('?');
	}

	// creates an array of objects whose name property have the value of the formData options
	var optionsArr = [];

	for(option in formData.pollOptions) {
		// only push the option value if its length is greater than 0 (not '')
		if(formData.pollOptions[option] !== '') {
			optionsArr.push({
				name: formData.pollOptions[option]
			});
		}
	}

	var poll = {
		title: title,
		author: {
			name: req.session.userInfo['screen_name'],
			twitterId: req.session.userInfo.id
		},
		options: optionsArr
	};

	Poll.addNew(poll, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			// redirect user to the poll they just created
			res.send({
				result: 'success',
				newPollId: result['_id']
			});
		}
	})
});

module.exports = router;