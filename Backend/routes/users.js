const express = require("express");
const router = express.Router();
const multer = require('multer');

/**
 * Multer spravuje nahrávání souborů
 * Úložiště je nastavené na paměť pro zpracování před uložením do DB
 * Omezení velikosti souboru na 2 MB a povolené pouze obrázkové soubory
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req,file,cb) => {
        if(!file.mimetype.startsWith('image/')) 
            return cb(new Error('File is not an image'));
        cb(null, true)
    }
})
//Importy middleware
const {getUserById, getUserByProfileId,verifyToken} = require('../middleware/user')

//Middleware pro validaci těla požadavku
const UserValidator = require('../middleware/validation/users')

//Importy controllerů
const UserController = require('../controller/users/users')
const CommentController = require('../controller/users/comment')
const AuthController = require('../controller/users/auth')
const NotificationsController = require('../controller/users/notifications')
const AnimeController = require('../controller/users/anime')

//Oznámení
router.get('/api/notification/stream', verifyToken, getUserById, NotificationsController.manageNotificationConnection)
router.get('/api/user/notifications', verifyToken, NotificationsController.getUserNotifications)
router.post("/api/users/notification/delete", UserValidator.deleteNotificationsValidation, verifyToken ,getUserById, NotificationsController.deleteNotifications)

//Uživatelé
router.post("/api/users/check-email", UserValidator.checkUsersEmailsValidator, UserController.checkUsersEmails);
router.post("/api/users/check-profileId", UserValidator.checkUsersProfileIdValidator, UserController.checkUsersProfileId);
router.post("/api/users/search", UserValidator.searchUsersForFilterValidator, UserController.searchUsersForFilter);
router.get("/api/users/username/:profileId", getUserByProfileId, UserController.getUsersInfo)
router.get("/api/users/avatar/:profileId", getUserByProfileId, UserController.getUserAvatar)
router.post('/api/users/private/', verifyToken, UserController.changeUserPrivate)
router.post("/api/users/edit/user", verifyToken , upload.single("avatar"), UserValidator.editUserValidator,  getUserById, UserController.editUser)
router.post("/api/users/follow/:profileId", verifyToken, getUserById, UserController.updateFollows)
router.delete("/api/user", verifyToken , getUserById, UserController.deleteUser)

//Anime
router.post("/api/users/anime/recommended", UserValidator.getRecommendedAnimesValidator, AnimeController.getRecommendedAnimes)
router.post("/api/users/anime/:id", verifyToken, getUserById, AnimeController.updateAnimeFavorites)

//Autentizace
router.get("/api/protected", verifyToken, getUserById, AuthController.sendUserInfo)
router.post("/api/users/login", UserValidator.loginUserValidation ,AuthController.loginUser)
router.post("/api/users/logout", verifyToken, getUserById, AuthController.logoutUser)
router.post("/api/users/register", UserValidator.registerUserValidation , AuthController.registerUser)

//Komentáře
router.post("/api/users/rating", verifyToken ,getUserById, UserValidator.addRatingValidator ,CommentController.addRating)
router.post('/api/users/rating/delete/:id', verifyToken, getUserById, CommentController.deleteCommentById)


module.exports = router;
