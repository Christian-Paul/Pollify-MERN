var mongoose = require('mongoose');

var pollSchema = new mongoose.Schema({
	title: String,
	author: {
		name: String,
		twitterId: Number
	},
	options: [{ name: String, votes: { type: Number, default: 0 } }],
	voters: Array
});

var Poll = mongoose.model('Poll', pollSchema);

exports.getRecent = function(callback) {
	Poll.find({}).
	sort({ '_id': -1 }).
	limit(10).
	exec(function(err, results) {
		if(err) {
			console.log(err);
			callback(err);
		} else {
			callback(null, results);
		}
	})
}

exports.getByAuthorId = function(authorId, callback) {
	Poll.find({ 'author.twitterId': authorId }, function(err, results) {
		if(err) {
			console.log(err)
		} else {
			callback(null, results);
		}
	});	
}

exports.getById = function(pollId, callback) {
	Poll.findOne({'_id': pollId}, function(err, result) {
		if(err) {
			console.log(err);
			callback(err);
		} else {
			callback(null, result)
		}
	})
}