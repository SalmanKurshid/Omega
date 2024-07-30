'use-strict'
const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

const UserResetPasswordSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    token_value: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        allowNull: false
    },
    expired_at: {
        type: Date,
        allowNull: false
    },
    used: {
        type: Number,
        allowNull: false,
        defaultValue: 0
    },
    inserted_at: {
        type: Date,
        allowNull: false
    },
}, { timestamps: {}  });

module.exports = mongoose.model('user_reset_password', UserResetPasswordSchema);