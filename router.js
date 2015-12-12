var express = require('express');
var router = module.exports = express.Router();
var path = require('path');

var appDir = path.join(__dirname, 'app');

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/:page', function(req, res) {
  res.render(req.params.page);
});

router.get('/pages/:page', function(req, res) {
  res.render('pages/' + req.params.page);
});

