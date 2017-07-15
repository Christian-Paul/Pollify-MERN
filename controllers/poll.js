var router = require('express').Router();
var Poll = require('../models/poll.js');

// get recent polls
router.get('/recent', function(req, res) {
	Poll.getRecent(function(err, results) {
		if(err) {
			console.log(err);
			res.status(500).send('Error connecting to database');
		} else {
			res.status(200).json(JSON.stringify(results));
		}
	});
});

// get poll by poll id
router.get('/:pollId', function(req, res) {
	Poll.getById(req.params.pollId, function(err, result) {
		if(err) {
			console.log(err);
			res.status(500).send('Error connecting to database');
		} else {
			res.status(200).json(JSON.stringify(result));
		}
	});
});

// add a new option to a poll
router.post('/:pollId/add-option', function(req, res) {
	// validate user input
	if(req.query.newOption.length < 1 || req.query.newOption.length > 50) {
		res.status(400).send('Invalid option length');
	} else {
		Poll.addNewOption(req.query.newOption, req.params.pollId, function(err, result) {
			if(err) {
				console.log(err);
				res.status(500).send('Error connecting to database');
			} else {
				res.status(200).send(result.options);
			}
		});
	}
});

// create a poll
router.post('/new', function(req, res) {
	// un-authenticated users can't create polls
	if(!req.session.userInfo) {
		res.status(401).send('Must be logged in to create polls');
	} else {
		var formData = req.body;

		// title is first item in array, formDataArr now contains only options
		var title = formData.pollTitle;

		// check to see if title ends in question mark, if it doesn't, add it
		if(title.lastIndexOf('?') !== (title.length - 1)) {
			title = title.concat('?');
		}

		// creates an array of objects whose name property have the value of the formData options
		var optionsArr = [];

		for(name in formData.pollOptions) {
			var option = formData.pollOptions[name];
			console.log(option);
			// only push the option value if it has an acceptable length
			if(option.length > 0 && option.length < 50) {
				optionsArr.push({
					name: option
				});
			}
		}

		if(title.length === 0 || title.length > 50 || optionsArr.length < 2) {
			res.status(400).send('Invalid title or options')
		} else {
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
					res.status(500).send('Error connecting to database');
				} else {
					// redirect user to the poll they just created
					res.status(200).send(result['_id']);
				}
			})
		}

	}
});

// delete a poll
router.delete('/:pollId', function(req, res) {
	// check if user is logged in
	if(!req.session.userInfo) {
		res.status(401).send('Polls can only be deleted by their author.');
	} else {
		// check if user is the author of this poll
		Poll.getById(req.params.pollId, function(err, result) {
			if(err) {
				res.status(500).send('Error connecting to database');
				console.log(err);
			} else {
				if(req.session.userInfo.id !== result.author.twitterId) {
					res.status(403).send('Polls can only be deleted by their author.');
				} else {
					Poll.deleteById(req.params.pollId, function(err, result) {
						if(err) {
							res.status(500).send('Error connecting to database');
							console.log(err);
						} else {
							res.status(200).send('Success');
						}
					})
				}
			}
		});
	}
});

// process a vote
router.post('/:pollId/vote', function(req, res) {

	// the number corresponding to the user's vote
	var userChoice = req.query.vote;

	// building a property name to pass to the update field
	// object will look like $inc: { options.2.votes: 1 }
	// to denote the option at index 2 is being incremented by 1
	var locationString = 'options.' + userChoice + '.votes';
	var updateObj = {};
	updateObj[locationString] = 1;

	// find poll and check if the current user has already voted
	Poll.getById(req.params.pollId, function(err, result) {
		if(err) {
			console.log(err);
			res.status(500).send('Error connecting to database');
		} else {
			// check to see if voters array contains the user's id or IP already
			if(req.session.hasOwnProperty('userInfo') && req.session.userInfo) {
				var userId = req.session.userInfo.id;
			} else {
				var userId = req.ip;
			}
			// if their id/ip is present, send error
			if(result.voters.indexOf(userId) !== -1) {
				res.status(409).send('This IP or user has voted already');
			} else {
				Poll.addVote(req.params.pollId, userId, updateObj, function(err, result) {
					if(err) {
						console.log(err);
						res.status(500).send('Error connecting to database');
					} else {
						res.status(200).send(result.options);
					}
				});
			}
		}		
	})
});

module.exports = router;