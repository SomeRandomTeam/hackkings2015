var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var cons = require('consolidate');
require('dotenv').load();

var app = module.exports = express();

app.set('views', path.join(__dirname, 'app', 'views'));
app.engine('html', cons.htmling);
app.set('view engine', 'html');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var db = mongoose.connect(process.env.DB_CONN);
require('./models');

app.use(function(req, res, next) {
  req.db = db;
  next();
});

app.use('/', require('./router'));

http.createServer(app).listen(process.env.PORT, function() {
  console.log('Express server listening on port ' + process.env.PORT);
});
