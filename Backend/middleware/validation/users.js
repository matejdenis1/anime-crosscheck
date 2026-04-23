const {body} = require('express-validator')
const deleteNotificationsValidation = [
    body('ids').notEmpty().isArray()
]
const loginUserValidation = [
    body('email').notEmpty().isEmail().isString(),
    body('password').notEmpty().isString()
]
const registerUserValidation = [
    body('email').notEmpty().isEmail().isString(),
    body('profileId').notEmpty().isString().isLength({min: 3, max: 20}),
    body('password').notEmpty().isString().isLength({min: 6, max: 128}),
    body('username').notEmpty().isString().isLength({min: 3, max: 20}),
    body('animes').notEmpty().isString()
]
const addRatingValidator = [
    body('animeId').notEmpty().isString(),
    body('comment').optional().isString().isLength({max: 150}),
    body('rating').notEmpty().isInt({min: 1, max: 5})
]
const editUserValidator = [
    body('username').optional().isString().isLength({min: 3, max: 20}),
    body('oldPassword').if(body('newPassword').notEmpty().isString()).notEmpty().isString(),
    body('newPassword').if(body('oldPassword').notEmpty().isString()).notEmpty().isString(),
    body('avatar').if(body('file').isString()).notEmpty().isString().optional()
]
const checkUsersEmailsValidator = [
    body('email').notEmpty().isString()
]
const checkUsersProfileIdValidator = [
    body('profileId').notEmpty().isString()
]
const searchUsersForFilterValidator = [
    body('filter').notEmpty().isString()
]
const getRecommendedAnimesValidator = [
    body('animes').notEmpty().isArray()
]

module.exports = {checkUsersEmailsValidator,checkUsersProfileIdValidator, searchUsersForFilterValidator,getRecommendedAnimesValidator, deleteNotificationsValidation, loginUserValidation, registerUserValidation, addRatingValidator, editUserValidator}
