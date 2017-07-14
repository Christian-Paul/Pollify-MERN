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
router.get('/:pollId/add-option', function(req, res) {
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

// delete a poll
router.get('/:pollId/delete', function(req, res) {
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
});

// process a vote
router.get('/:pollId/vote', function(req, res) {

	// the number corresponding to the user's vote
	var userChoice = req.query.vote;

	// building a property name to pass to the update field
	// object will look like $inc: { options.2.votes: 1 }
	// to denote the option at index 2 is being incremented by 1
	var locationString = 'options.' + userChoice + '.votes';
	var updateObj = {};
	updateObj[locationString] = 1;

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
});

module.exports = router;