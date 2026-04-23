
const UserService = require('../service/users/users');
const jwt = require('jsonwebtoken')
require('dotenv').config()

const getUserById = async (req,res,next) => {
  try{
    const userId = req.params.userId
    const user = await UserService.getUserById(userId)
    // Pro jistotné vymazaní cookies při špatném tokenu
    if(!user){
      res.cookie('token', '', {httpOnly: true,sameSite: 'lax',expires: new Date(0)})
      return res.status(404).json({message: `User not found for userId: ${userId}`})
    }
    req.user = user
    next()
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}

const getUserByProfileId = async (req,res,next) => {
  try{
    const profileId = req.params.profileId
    const user = await UserService.getUserByProfileId(profileId)
    if(!user){
      return res.status(404).json({message: `User not found for profileId: ${profileId}`})
    }
    req.user = user;
    next();
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}


const verifyToken = async (req,res,next) => {
  let token = req.cookies?.token
  if(!token || token == null){
    return res.status(401).json({message: "No token provided!"})
  }
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if(err){
      return res.status(401).send({auth: false, message: 'Failed to authenticate token.'})
    }
    req.params.userId = decoded.id
    next()
  })
}

module.exports = {getUserById, getUserByProfileId, verifyToken}