var db = require('mongoose');
var Schema = db.Schema;

db.model('User', new Schema({
  name: {
    type: String,
    trim: true,
    minlength: [5, 'The value of path `{PATH}` (`{VALUE}`) is shorter than the minimum allowed length ({MINLENGTH}).']
  },
  publicKey: String,
  picture: { data: Buffer, contentType: String },
  phoneNumber: String,
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  whitelisted: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  blacklisted: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
}));

db.model('Message', new Schema({
  content: String,
  timestamp: Date,
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receivers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}));


