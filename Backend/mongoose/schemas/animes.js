const mongoose = require('mongoose')

const animeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        romaji: {
            type: String,
        },
        english: {
            type: String,
        },
        episodeDate: {
            type: Date,
        },
        episodeNumber: {
            type: Number,
        },
        imageVersionRoute: {
            type: String,
        },
        verified: {
            type: Boolean,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        genres: {
            type: Array,
        },
        status: {
            type: String
        },
        description: {
            type: String
        },
        manualVerification: {
            type: Boolean,
            default: false
        }
    }
)
animeSchema.index({title: 1}, {unique: true})
const Animes = mongoose.model('Animes', animeSchema);

module.exports = Animes;