'use-strict'
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const UsersSchema = new Schema({
    ssh_key: {
        type: String,
    },
    Type: {
        type: String,
    },
    status: {
        type: String,
    },
    name: {
        type: String,
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
    access: {
        type: Boolean,
    },
    role: {
        type: String,
    }
}, { timestamps: {}  });

module.exports = mongoose.model('users', UsersSchema);