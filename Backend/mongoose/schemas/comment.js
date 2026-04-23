const mongoose = require('mongoose')
const comment = new mongoose.Schema(
    {
        animeId: {
            type: String,
            required: true
        },
        user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
        },
        animeName: {
            type: String,
            required: true
        }
        ,message: {
            type: String,
        },
        rating: {
            type: Number,
            required: true
        },
        updatedAt: {
            type: mongoose.Schema.Types.Date,
            required: true
        }
    }
)
const Comment = mongoose.model('Comments', comment);

module.exports = Comment;