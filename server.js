var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var Twitter = require('node-twitter-api');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
require('express-helpers')(app);
app.enable('trust proxy');
var port = process.env.PORT || 3000;

// get credentials from config file in dev, or from heroku env in deployment
if(port === 3000) {
	var config = require('./config.js');
} else {
	var config = {
		mongooseUsername: process.env.mongooseUsername,
		mongoosePassword: process.env.mongoosePassword,
		consumerKey: process.env.consumerKey,
		consumerSecret: process.env.consumerSecret,
		callbackUrl: process.env.callbackUrl,
		sessionSecret: process.env.sessionSecret
	};
}

var sessionOptions = {
	secret: config.sessionSecret,
	saveUninitialized: true,
	resave: false,
	store: new FileStore(),
	name: 'my.connect.sid'
};

// middleware
app.use(session(sessionOptions));
app.use('/bin', express.static(path.join(__dirname, 'bin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

var twitter = new Twitter({
	consumerKey: config.consumerKey,
	consumerSecret: config.consumerSecret,
	callback: config.callbackUrl
});

// database initialization
mongoose.connect('mongodb://' + config.mongooseUsername + ':' + config.mongoosePassword + '@ds161245.mlab.com:61245/fcc-voting');



// begin app
app.listen(port, function(req, res) {
	console.log('listening on 3000');
})

// sends index page for react to build off of; all other routes are apis to support the react routes
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/src/index.html');
});

var _requestSecret;

// when a user clicks 'sign in' get a request token from twitter and redirect user to sign in with token
app.get('/request-token', function(req, res) {
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
app.get('/login/twitter/callback', function(req, res) {
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
app.get('/sign-out', function(req, res) {
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
app.get('/check-auth', function(req, res) {
	if(req.hasOwnProperty('session') && req.session.hasOwnProperty('userInfo')) {
		res.send(req.session.userInfo);
	} else {
		res.send('not authenticated');
	}
});

var Poll = require('./models/poll.js');

// get recent polls
app.get('/recent-polls', function(req, res) {
	Poll.getRecent(function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	});
});

// get polls by user id
app.get('/user-polls/:tagId', function(req, res) {
	Poll.getByAuthorId(req.params.tagId, function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	})
});

// get poll by poll id
app.get('/polls/:tagId', function(req, res) {
	Poll.getById(req.params.tagId, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(result));
		}
	});
});

// process a vote
app.get('/vote', function(req, res) {

	// the number corresponding to the user's vote
	var userChoice = req.query.vote;

	// building a property name to pass to the update field
	// object will look like $inc: { options.2.votes: 1 }
	// to denote the option at index 2 is being incremented by 1
	var locationString = 'options.' + userChoice + '.votes';
	var updateObj = {};
	updateObj[locationString] = 1;


	// find poll and check if the current user has already voted
	Poll.findOne( {'_id': req.query.pollId}, function(err, doc) {
		if(err) {
			console.log(err);
		} else {
			// check to see if voters array contains the user's id or IP already
			// if their id/IP is present, userAlreadyVoted returns true
			if(req.session.hasOwnProperty('userInfo') && req.session.userInfo) {
				var userId = req.session.userInfo.id;
			} else {
				var userId = req.ip;
			}
			var userAlreadyVoted = (doc.voters.indexOf(userId) !== -1);

			if(userAlreadyVoted) {
				res.send({
					result: 'fail',
					message: 'This account or IP address has already voted'
				});
			} else {
				// new set to true so doc object will return updated value
				Poll.findOneAndUpdate( {'_id': req.query.pollId}, { $inc: updateObj, $push: { voters: userId } }, { new: true }, function(err, doc) {
					if(err) {
						console.log(err);
					} else {
						res.send({
							result: 'success',
							message: 'Vote casted for: ' + doc.options[userChoice].name,
							pollOptions: doc.options
						});
					}
				});
			}
		}
	});
});

// add a new option to a poll
app.get('/add-option', function(req, res) {
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
app.get('/delete-poll', function(req, res) {
	Poll.findByIdAndRemove(req.query.pollId, function(err, doc) {
		if(err) {
			console.log(err);
		} else {
			res.send({
				result: 'success',
				pollOptions: doc.options
			});
		}
	})
});

app.post('/create-poll', function(req, res) {
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

	var newPoll = new Poll({
		title: title,
		author: {
			name: req.session.userInfo['screen_name'],
			twitterId: req.session.userInfo.id
		},
		options: optionsArr
	});

	newPoll.save(function(err, poll) {
		if(err) {
			console.log(err);
		} else {
			// redirect user to the poll they just created
			res.send({
				result: 'success',
				newPollId: poll['_id']
			});
		}
	});	

});