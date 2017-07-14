var router = require('express').Router();
var Poll = require('../models/poll.js');

// get recent polls
router.get('/recent', function(req, res) {
	Poll.getRecent(function(err, results) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	});
});

// get poll by poll id
router.get('/:pollId', function(req, res) {
	Poll.getById(req.params.pollId, function(err, result) {
		if(err) {
			console.log(err);
		} else {
			res.json(JSON.stringify(result));
		}
	});
});

// add a new option to a poll
router.post('/:pollId/add-option', function(req, res) {
	Poll.addNewOption(req.query.newOption, req.params.pollId, function(err, result) {
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
				console.log(err);
			} else {
				if(req.session.userInfo.id !== result.author.twitterId) {
					res.status(403).send('Polls can only be deleted by their author.');
				} else {
					Poll.deleteById(req.params.pollId, function(err, result) {
						if(err) {
							console.log(err);
						} else {
							res.send({
								result: 'success',
								pollOptions: result.options
							});
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
			callback(err);
		} else {
			// check to see if voters array contains the user's id or IP already
			if(req.session.hasOwnProperty('userInfo') && req.session.userInfo) {
				var userId = session.userInfo.id;
			} else {
				var userId = req.ip;
			}
			// if their id/ip is present, send error
			if(result.voters.indexOf(userId) === -1) {
				res.status(409).send('This IP or user has voted already');
			} else {
				Poll.addVote(req.params.pollId, req.session, req.ip, updateObj, function(err, result) {
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
			}
		}		
	})



});

module.exports = router;