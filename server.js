var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
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
	name: 'my.connect.sid',
	cookie: {
		httpOnly: false,
		secure: false,
		maxAge: 31540000000
	}
};

// database initialization
mongoose.connect('mongodb://' + config.mongooseUsername + ':' + config.mongoosePassword + '@ds161245.mlab.com:61245/fcc-voting');

// begin app
app.listen(port, function(req, res) {
	console.log('listening on 3000');
})

// middleware
app.use(session(sessionOptions));
app.use('/bin', express.static(path.join(__dirname, 'bin')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers'));