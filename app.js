var express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	app = express(),
	tmpFolder,
	models,
	mongoose = require('mongoose'),
	debug = require('debug')('node-express-subtitulos-es');

// setting tmp dir
tmpFolder = path.join(__dirname, 'tmp');
// creating tmp folder if not exists
if (!fs.existsSync(tmpFolder)) {
	fs.mkdir(tmpFolder);
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(serveStatic(path.join(__dirname, 'public')));

//Preparing DB
mongoose.connect(process.env.DB_URI, function(err, res) {
    if(err) throw err;
    debug('Connected to Database');
});
models = require('./models/tvShow')(app, mongoose);

//Injection of global variables
app.use(function(req, res, next) {
	res.locals.tmpFolder = tmpFolder;
	next();
});

//Router declaration
var router = require('./router');
app.use('/', router);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.render('error', {
		message: err.message,
		error: {}
	});
});

module.exports = app;