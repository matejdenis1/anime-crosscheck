const User = require('../../mongoose/schemas/user')
const fs = require('fs')
const path = require('path')
const argon2 = require("argon2")
require('dotenv').config()
const jwt = require('jsonwebtoken')
const Animes = require('../../mongoose/schemas/animes')
const ONE_DAY = 86400000

//Chachování výchozího avataru, aby se načítal pouze jednou a ne při každém vytvoření uživatele
let defaultAvatar;
const getDefaultAvatar = () => {
    if(defaultAvatar) return defaultAvatar;
    const defaultPath = path.join(process.cwd(), 'misc', 'pfp_placeholder.png')
    defaultAvatar = fs.readFileSync(defaultPath);
    return defaultAvatar;
}
//Kontrola dostupnosti profileId a emailu, aby nedocházelo k duplicitám v databázi.
const profileIdExists = async (profileId) => {
  const existingProfileId = await User.findOne({ profileId });
  return !!existingProfileId
}
const emailExists = async (email) => {
  const existingEmail = await User.findOne({ email });
  return !!existingEmail
}

const hashPassword = async (password) => {
  const hash = await argon2.hash(password);
  return hash;
}
const checkPassword = async (hash, password) => {
  const passwordEquals = await argon2.verify(hash, password)
  return passwordEquals;
}

const findUserByEmail = async (email) => {
  const user = await User.findOne({email: email})
  return user;
}

const filterAnimesBasedOnDatabase = async (animes) => {
  const validIds = await Animes.distinct('id', {id: {$in: animes}});
  return animes.filter(id => validIds.includes(id));
}
//Parsování pro přebírání anime z local storage do databázové prostředí
const safeParse = (json, defaultValue = []) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return defaultValue;
  }
}
const createUser = async (form) => {
  const {email, username, profileId, password} = form
  let animes = safeParse(form.animes); //Pokud parsování selže, vrátí prázdné pole
  if(animes.length !== 0){
    animes = await filterAnimesBasedOnDatabase(animes); //Zabraňuje uživateli přidat anime, která nejsou v databázi
  }
  const user = new User()
  user.email = email;
  user.type = 'user'
  user.animes = animes;
  user.username = username;
  user.hash = await hashPassword(password)
  user.profileId = profileId;
  user.avatar = {
    data: getDefaultAvatar(),
    contentType: 'image/png'
  }
  await user.save();
  return user;
}
const createToken = (userId) => {
  const token = jwt.sign({id: userId}, process.env.JWT_SECRET, {
      expiresIn: ONE_DAY
  })
  return token
}
module.exports = {createToken, createUser, findUserByEmail, emailExists, profileIdExists, checkPassword, hashPassword}