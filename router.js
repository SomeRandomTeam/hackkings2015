var express = require('express');
var router = module.exports = express.Router();
var path = require('path');

var appDir = path.join(__dirname, 'app');

router.get('/', function(req, res) {
  res.render('index');
});

