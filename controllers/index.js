var router = require('express').Router();
var config = require('../config');
var Poll = require('../models/poll.js');

router.use('/poll', require('./poll.js'));
router.use('/auth', require('./auth.js'));

// sends index page for react to build off of; all other routes are apis to support the react routes
router.get('/', function(req, res) {
	res.sendFile('index.html', { root: 'src' });
});

// get polls by user id
router.get('/user/:userId', function(req, res) {
	Poll.getByAuthorId(req.params.userId, function(err, results) {
		if(err) {
			res.status(500).send('Error connecting to database');
			console.log(err);
		} else {
			res.json(JSON.stringify(results));
		}
	})
});

module.exports = router;