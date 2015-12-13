var _ = require('lodash');
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
      .populate('friends', 'name publicKey')
      .populate('whitelisted', 'name publicKey')
      .populate('blacklisted', 'name publicKey')
      .populate({
        path: 'messages',
        populate: {
          path: 'sender',
          select: 'name publicKey'
        }
      })
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

router.route('/api/users/:user/friends').all(getUser)
.get(function(req, res) {
  res.json(req.user.friends);
}).post(function(req, res) {
  req.user.depopulate('friends');
  req.user.friends.push(req.body._id);
  req.user.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.status(200).end();
    }
  });
}).delete(function(req, res) {
  req.user.depopulate('friends');
  req.user.friends.pull(req.body._id);
  req.user.save(function(err) {
    if(err) {
      res.status(500).json(err);
    } else {
      res.status(200).end();
    }
  });
});

router.route('/api/users/:user/messages').all(getUser)
.get(function(req, res) {
  res.json({
    sentMessages: req.user.sentMessages,
    receivedMessages: req.user.receivedMessages
  });
});

router.route('/api/sendmessage').post(function(req, res) {
  req.body.receivers = _.uniq(req.body.receivers);
  var message = new Message(req.body);
  console.log(message);
  message.save(function(err, message) {
    console.log(message);
    if(err) {
      res.status(500).json(err);
    } else {
      message.populate('sender receivers', function(err) {
        if(err) {
          res.status(500).json(err);
        } else {
          message.sender.messages.push(message._id);
          message.sender.save(function(err) {
          });
          console.log(message.receivers);
          message.receivers.forEach(function(receiver) {
            receiver.messages.push(message._id);
            receiver.save(function(err) {
            });
          });
        }
        res.status(200).end();
      });
    }
  });
});

