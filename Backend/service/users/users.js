const Comment = require('../../mongoose/schemas/comment');
const User = require('../../mongoose/schemas/user')
const mongoose = require('mongoose')
const Fuse = require('fuse.js');
//Vytváří payload objekt, který se posílá klientovi bez citlivých dat
const createUserSavePayload = (user) => {
  const userObject = user.toObject()
  const {password, hash, animes, ...payload} = userObject;
  payload.follows = (payload.follows || []).map(follow => {
    if(!follow.private) return follow;
    return { _id: follow._id, username: follow.username, profileId: follow.profileId };
  });
  //Pokud je uživatel nastaven jako soukromý, nevracíme jeho anime list
  if(payload.private === true) return {...payload};
  return {...payload, animes}
}
const changeUserPrivate = async (userId) =>{
  const privateAfterChange = await User.findOneAndUpdate({_id: userId},
    [{$set: {private: {$not: '$private'} } } ],
    {new: true} 
  )
  return privateAfterChange.private ? 'Anime view changed to private' : 'Anime view changed to public'
}

//Použitím fuzzy search pro hledání uživatelů podle username nebo profileId
//, vrací pouze profileId a username pro rychlejší hledání
const searchUsersForFilter = async (filter) => {
  if(!filter) return [];
  const users = await User.find({}, 'profileId username')
  const usersFuse = new Fuse(users, {
    keys: ['username', 'profileId'],
    threshold: 0.3
  });
  const results = usersFuse.search(filter);
  return results.map(result => result.item);
}

const getUserByProfileId = async (profileId) => {
  const user = await User.findOne({profileId}).populate('follows', 'profileId username').populate('followers','profileId username')
  return user;
}

const deleteUser = async (user) => {
  const id = user._id
  const followers = user.followers;
  await User.deleteOne({_id: id})
  //Smaže data související s uživatelem
  await deleteUsersComments(id);
  await removeUserFromFollowers(id, followers)
}
const deleteUsersComments = async (id) => {
  await Comment.deleteMany({user: id})
}
const removeUserFromFollowers = async (userId, followers) => {
  await User.updateMany({_id: {$in: followers}}, {
    $pull: {follows: userId}
  })
}
const updateUser = async (editData, userId) => {
  await User.updateOne({_id: userId}, {
    $set: {...editData}
  })
}
//Při přidávání follow se kontroluje, zda uživatel nedostal notifikaci o follow v poslední hodině,
//pokud ano, nevytváří se nová notifikace, aby se zabránilo spamu notifikací při opakovaném follow/unfollow
const FOLLOW_NOTIFICATION_COOLDOWN_MS = 60 * 60 * 1000; // <-- 1 hodina v milisekundách
const addFollow = async (userId, followId) => {
  const cooldown = new Date(Date.now() - FOLLOW_NOTIFICATION_COOLDOWN_MS);
  //Zjišťuje jestli už existuje nedávná notifikace o follow mezi těmito dvěma uživateli
  const recentFollowNotification = await User.findOne({
    _id: followId,
    notifications: {
      $elemMatch: {
        user: userId,
        'action.followed': 'you',
        timestamp: { $gte: cooldown }
      }
    }
  }, { _id: 1 })

  //Když existuje nedávná notifikace, přidá se follow bez vytváření nové notifikace
  if(recentFollowNotification){
    await Promise.all([
      User.updateOne({_id: userId}, {$push: {follows: followId}}),
      User.updateOne({_id: followId}, {$push: {followers: userId}})
    ])
    return null
  }

  //Jinak se vytvoří notifikace a přidá se follow
  const notification = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    action: {followed: 'you'},
    timestamp: new Date()
  }
  await Promise.all([
      User.updateOne({_id: userId}, {$push: {follows: followId}}),
      User.updateOne({_id: followId}, {$push: {followers: userId, notifications: notification}})
  ])
  const notificationPayload = await User.populate(notification, {
      path: 'user', select: '_id username profileId'
  })
  return notificationPayload
}
const removeFollow = async (userId, followId) => {
  await Promise.all([ 
         User.updateOne({_id: userId}, {$pull: {follows: followId}}), 
         User.updateOne({_id: followId}, {$pull: {followers: userId}})
    ])
}


const getUserById = async (userId) => {
  const user = await User.findById(userId).populate('follows', 'profileId username animes private').populate('followers', 'profileId username');
  if(!user) return null;
  return user;
}


module.exports = {searchUsersForFilter, getUserById,removeFollow,addFollow, updateUser, createUserSavePayload,
     changeUserPrivate, deleteUser, getUserByProfileId}