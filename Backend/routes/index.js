const express = require("express");

const router = express.Router()

const animeRouter = require("./anime")
const userRouter = require("./users");
const homepageRouter = require("./homepage");

router.use(homepageRouter);
router.use(animeRouter);
router.use(userRouter);

module.exports = router
