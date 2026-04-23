const express = require("express");
const router = express.Router();

const HomepageService = require('../service/homepage/homepage')

router.get("/api/homepage", async (req,res) => {
  try{
    const homepage = await HomepageService.createHomepage();
    res.status(200).json({...homepage});
  } catch(err){
    console.error(err.message)
    res.status(500).json({message: err.message})
  }
})

module.exports = router;