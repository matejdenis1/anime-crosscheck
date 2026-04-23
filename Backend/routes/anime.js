
const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const BodyValidations = require('../middleware/validation/anime')
const AnimeController = require('../controller/anime.js')
const {getUserById, verifyToken} = require('../middleware/user');


//Routy
router.get("/api/anime/:id", AnimeController.getAnimeById)
router.get("/api/animes", AnimeController.getVerifiedAnimes);
router.post("/api/anime/verify/", verifyToken, getUserById, upload.any(), BodyValidations.verifyAnimeValidation, AnimeController.verifyAnime)
router.get("/api/animes/validation", verifyToken, getUserById, AnimeController.getAnimesForValidation)

module.exports = router;