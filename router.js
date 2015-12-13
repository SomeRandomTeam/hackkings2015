var _ = require('lodash');
var express = require('express');
var router = module.exports = express.Router();
var path = require('path');
var multer = require('multer');
var fs = require('fs');

var db = require('mongoose');
var User = db.model('User');
var Message = db.model('Message');

var appDir = path.join(__dirname, 'app');

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET
});

router.get('/', function(req, res) {
  if(req.cookies.userId) {
    res.redirect('/pages/messenger');
  } else {
    res.redirect('/pages/login');
  }
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

router.route('/api/users')
.post(multer().single('picture'), function(req, res) {
  var user = new User(req.body);
  if(req.file) {
    user.picture.contentType = req.file.mimetype;
    user.picture.data = req.file.buffer;
  } else {
    var imgDir = path.join(__dirname, 'public', 'assets', 'img');
    var imgNames = [
      "leafBLUISH.png",
      "leafGREEEENNN.png",
      "leafGREEEEYYY.png",
      "leafREEEEED.png",
      "leafYELLOWWWW.png"
    ];
    var idx = Math.floor(Math.random() * imgNames.length);
    user.picture.data = fs.readFileSync(path.join(imgDir, imgNames[idx]));
    user.picture.contentType = 'image/png';
  }
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

router.route('/api/users/:user').all(getUser)
.post(multer().single('picture'), function(req, res) {
  if(req.file) {
    req.body.picture = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }
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
  message.save(function(err, message) {
    if(err) {
      res.status(500).json(err);
    } else {
      message.populate('sender receivers', function(err) {
        if(err) {
          res.status(500).json(err);
        } else {
          pusher.trigger('message-channel', 'msg', message);
          message.receivers.forEach(function(receiver) {
            receiver.messages.push(message._id);
            receiver.save(function(err) {
              console.log('sending ' + message._id + ' message to user-' + receiver._id);
              pusher.trigger('user-' + receiver._id, 'msg', message._id);
            });
          });
        }
        res.status(200).end();
      });
    }
  });
});

router.route('/api/messages/:message').get(function(req, res) {
  Message.findById(req.params.message)
    .populate('sender', 'name publicKey')
    .populate('receivers', 'name publicKey')
    .exec(function(err, message) {
      if(err) {
        res.status(500).json(err);
      } else {
        res.json(message);
      }
  });
});
