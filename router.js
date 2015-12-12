var express = require('express');
var router = module.exports = express.Router();
var path = require('path');

var db = require('mongoose');
var User = db.model('User');
var Message = db.model('Message');

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

router.route('/api/users').post(function(req, res) {
  var user = new User(req.body);
  user.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.redirect('/pages/messenger');
    }
  });
}).get(function(req, res) {
  var query = User.find({}).select('name publicKey');
  query.exec(function(err, docs) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.json(docs);
  });
});

router.route('/api/users/:user').all(function(req, res, next) {
  User.findById(req.params.user, function(err, user) {
    if(err) {
      res.status(500).json(err);
    } else {
      req.user = user;
      next();
    }
  });
}).post(function(req, res) {

}).get(function(req, res) {
  res.json(req.user);
});

router.route('/api/users/:user/picture').all(function(req, res) {
}).get(function(req, res) {
});
