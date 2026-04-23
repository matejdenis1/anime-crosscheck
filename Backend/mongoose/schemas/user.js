
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true
        },
        profileId: {
            type: String,
        },
        email: {
            type: String,
        },
        username: {
            type: String,
        },
        hash:{
            type: String,
        },
        animes: {
            type: Array,
            required: true
        },
        avatar: {
            data: Buffer,
            contentType: String
        },
        follows: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        followers: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User'
                }
            ]
        },
        private: {
            type: Boolean
        },
        notifications: [
                {
                    user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'User'
                    },
                    action: {
                        type: Object
                    },
                    timestamp: {
                        type: Date
                    }
                }
            ]
    }
)
const User = mongoose.model('User', userSchema);

module.exports = User;