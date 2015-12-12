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

var getUser = function(req, res, next) {
  User.findById(req.params.user)
      .populate('friends whitelisted blacklisted receivedMessages')
      .exec(function(err, user) {
    if(err) {
      res.status(500).json(err);
    } else {
      req.user = user;
      next();
    }
  });
};

router.route('/api/users').post(function(req, res) {
  var user = new User(req.body);
  user.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.cookie('userId', user._id, {
        maxAge: 365 * 24 * 60 * 60 * 1000
      });
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

router.route('/api/getmyself').get(function(req, res) {
  User.findById(req.cookies.userId).select('_id').exec(function(err, user) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.json(user);
    }
  });
});

router.route('/api/users/:user').all(getUser).post(function(req, res) {
  User.findOneAndUpdate({ _id: req.user._id}, req.body, function(err, doc) {
    if(err) {
      res.status(500).json(err);
      return;
    }
    res.status(200).end();
  });
}).get(function(req, res) {
  res.json(req.user);
});

router.route('/api/users/:user/picture').all(getUser).get(function(req, res) {
  res.end(req.user.picture.data);
});

router.route('/api/users/:user/addfriend').all(getUser).post(function(req, res) {
  req.user.friends.push(req.body);
  req.user.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.status(200).end();
    }
  });
});
