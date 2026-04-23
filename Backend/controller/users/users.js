const UserService = require('../../service/users/users')
const CommentService = require('../../service/users/comment')
const AnimeService = require('../../service/users/anime')
const AuthService = require('../../service/users/auth')
const NotificationsService = require('../../service/users/notifications')
const AnimeDataService = require('../../service/anime/anime')

const { validationResult } = require('express-validator');

//Kontrola existence uživatele s daným profileId, používá se při registraci
const checkUsersProfileId = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
  }
  try{
      const {profileId} = req.body;
      const user = await UserService.getUserByProfileId(profileId);
      return res.status(200).json({exists: !!user})
  } catch(err){
      return res.status(500).json({message: err.message})
  }
}
//Kontrola existence uživatele s daným emailem, používá se při registraci
const checkUsersEmails = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
  }
  try{
      const {email} = req.body;
      const emailExists = await AuthService.emailExists(email);
      return res.status(200).json({exists: emailExists})
  } catch(err){
      return res.status(500).json({message: err.message})
  }
}
//Metoda pro hledání uživatelů podle zadaného filtru, používá se při hledání uživatelů v navigačním baru
const searchUsersForFilter = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array()})
  }
  try{
    const {filter} = req.body;
    const users = await UserService.searchUsersForFilter(filter);
    return res.status(200).json(users)
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Vrátí informace o uživateli, používá se na stránce profilu, pokud je profil soukromý, nevrací informace o animech a žánrech
 const getUsersInfo = async (req,res) => {
   try{
    const user = req.user;
    const genres = await AnimeService.getGenresForUserAnimes(user.animes);
    const comments = await CommentService.getUserComments(user._id)
    const userSavePayload = UserService.createUserSavePayload(user);
    const animes = user.private ? [] : await AnimeDataService.getUsersAnimes(user.animes)
    return res.status(200).json({...userSavePayload, genres, comments, animes})
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
 const getUserAvatar = (req,res) => {
   try{
    const user = req.user;
    if(!user || !user.avatar || !user.avatar.data){
      return res.status(404).json({message: 'Avatar not found'})
    }
    res.set('Content-Type', user.avatar.contentType)
    res.send(user.avatar.data);
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
 const changeUserPrivate = async (req,res) => {
  try{
    const userId = req.params.userId
    const message = await UserService.changeUserPrivate(userId);
    return res.status(200).json({message})
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Jelikož z FE může přijít více různých dat pro úpravu uživatele, tato metoda zkontroluje, které pole se má upravit a podle toho zavolá příslušnou metodu pro úpravu
 const editUser = async (req,res) => {
    //Získá chyby z validace
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    try{
    const form = req.body
    const {username, newPassword, oldPassword} = form;
    const user = req.user;

    if(username){
      await UserService.updateUser({username}, user._id);
      return res.status(200).json({message: 'Username successfully changed!', update: 'username'});
    }

    if(oldPassword && newPassword){
      const passwordEquals = await AuthService.checkPassword(user.hash, oldPassword)
      if(!passwordEquals) return res.status(403).json({message: 'Wrong old password'})

      const hash = await AuthService.hashPassword(newPassword);
      await UserService.updateUser({hash}, user._id)
      return res.status(200).json({message: 'Password successfully changed!', update: 'password'});
    }

    if(req.file?.buffer){
      await UserService.updateUser({avatar: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }}, user._id)
      return res.status(200).json({message: 'Profile picture successfully changed!', update: 'avatar'});
    }

    return res.status(400).json({message: 'No valid fields to update'});
  } catch(err){
    console.error(err)
    return res.status(500).json({message: err.message})
  }
}
 const updateFollows = async (req,res) => {
  try{
    const user = req.user;
    const profileId = req.params.profileId

    if(user.profileId === profileId) return res.status(403).json({message: 'You cannot follow yourself!'})

    //Získá uživatele, kterého chceme sledovat
    const follow = await UserService.getUserByProfileId(profileId)
    if(!follow) return res.status(404).json({message: `User not found for profileId: ${profileId}`})
    const alreadyFollows = user.follows.some(f => (f._id).equals(follow._id))
    if(alreadyFollows){
      await UserService.removeFollow(user._id, follow._id);
      return res.status(201).json({message: `${follow.username} was excluded from your follows!`})
    } else{
      //Přidá uživatele do sledovaných a vytvoří notifikaci pro sledovaného uživatele
      const notification = await UserService.addFollow(user._id, follow._id)
      if(notification) NotificationsService.notifyUser(follow._id, notification)
      return res.status(201).json({message: `${follow.username} was included to your follows!`})
    }
  } catch(err){
    console.error(err)
    return res.status(500).json({message: err.message})
  }
}
//Smazání uživatele, smaže se z databáze a zároveň se vyčistí cookies, aby uživatel nebyl přihlášen
 const deleteUser = async (req,res) => {
  try{
    const user = req.user;
    await UserService.deleteUser(user);
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) }); // Vyčistí cookies
    return res.status(200).json({message: 'User deleted successfully'})
  } catch(err){
    console.log(err.message)
    return res.status(500).json({message: err.message})
  }
}
module.exports = {checkUsersEmails, checkUsersProfileId,deleteUser,updateFollows, editUser, getUsersInfo, getUserAvatar, changeUserPrivate, searchUsersForFilter}