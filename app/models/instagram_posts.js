'use-strict'
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const UsersSchema = new Schema({
    user_name: {
        type: String,
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    posts: {
        type: Array,
        default: []
    },
}, { timestamps: {}  });

module.exports = mongoose.model('instagram', UsersSchema);