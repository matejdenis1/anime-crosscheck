
const AuthService = require('../../service/users/auth')
const UserService = require('../../service/users/users')

const { validationResult } = require('express-validator');

const ONE_DAY = 86400000

//Přihlášení uživatele
const loginUser = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }

  try{
    const {email, password} = req.body;
    const user = await AuthService.findUserByEmail(email)
    if(!user){
      return res.status(404).json({message: 'Bad credentials!'})
    }
    const passwordCheck = await AuthService.checkPassword(user.hash, password)
    // Po ověření hesla se vytvoří token, který se následně pošle klientovi jako cookie.
    if(passwordCheck){
      const token = AuthService.createToken(user._id);
      // V produkčním prostředí by se mělo nastavit secure: true a zajistit, že vaše aplikace běží přes HTTPS
      res.cookie('token', token, {httpOnly: true, sameSite: 'lax', maxAge: ONE_DAY, secure: false})
      res.status(200).json({auth: true,message: 'Login successful.. Welcome!'})
    } else{
      return res.status(404).json({message: 'Bad credentials!'})
    }
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Odhlášení uživatele
 const logoutUser = (req,res) => {
  try{
    const user = req.user
    if(!user){
      return res.status(403).json({message: 'Action prohibited!'})
    }
    // Vymazání cookie s tokenem nastavením její expirace na minulost
    res.cookie('token', '', {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(0)
    })
    return res.status(200).json({message: 'Logout was successful.. cookie cleared!'})
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Posílání informace o přihlášeném uživateli
const sendUserInfo = async (req,res) => {
  try{
    const user = req.user;
    const saveUserPayload = UserService.createUserSavePayload(user);
    return res.status(200).json({auth: true, user: {...saveUserPayload, animes: user.animes}})
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Registrace uživatele
 const registerUser = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    try{
        const form = {...req.body}
        if(form.profileId.startsWith('@') === false){
          form.profileId = '@'+form.profileId.trim();
        }
        const {email, profileId} = form;
        //Kontrola existence emailu a profileId v databázi, aby se předešlo duplicitám. je.
        const existingEmail = await AuthService.emailExists(email)
        const existingProfileId = await AuthService.profileIdExists(profileId)
        if(existingEmail && existingProfileId) return res.status(409).json({email: "Email is already taken!", profileId: "Profile ID is already taken!"});
        if(existingEmail) return res.status(409).json({email: "Email is already taken!"});
        if(existingProfileId) return res.status(409).json({profileId: "Profile ID is already taken!"});
        const createdUser = await AuthService.createUser(form);
        const token = AuthService.createToken(createdUser._id)
        res.cookie('token', token, {httpOnly: true, sameSite: 'lax', maxAge: ONE_DAY, secure: false})
        return res.status(200).json({message: 'You have been successfully registered!', created: true})
    } catch(err){
        console.error(err)
        return res.status(500).json({message: err.message})
    }
}
module.exports = {loginUser,registerUser,sendUserInfo,logoutUser}