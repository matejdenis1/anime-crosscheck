const {body} = require('express-validator');


const verifyAnimeValidation = [
    body('title').notEmpty().isString(),
    body('id').notEmpty().isString(),
    body('genres').optional().isString(),
    body('verified').notEmpty().isBoolean().isBoolean()
]

module.exports = {verifyAnimeValidation}