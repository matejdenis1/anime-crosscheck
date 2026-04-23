const Comment = require('../../mongoose/schemas/comment')
const User = require('../../mongoose/schemas/user')
const Animes = require('../../mongoose/schemas/animes')
const mongoose = require('mongoose')
const editComment = async (comment, form) => {
  const timeNow = new Date();
  const {rating, comment: text} = form;
  comment.message = text;
  comment.rating = rating;
  comment.updatedAt = timeNow
  await comment.save();
}
const createComment = async (form, user) => {
  const timeNow = new Date();
  const {animeId: id, rating, comment: text} = form;
  
  const anime = await Animes.findOne({id: id})
  if(!anime) throw new Error('Anime not found for id: ' + id)
  const {title} = anime
  const comment = new Comment({
    user: user._id,
    message: text || '',
    updatedAt: timeNow,
    rating,
    animeName: title,
    animeId: id
  })
  await comment.save();

  //Vytváří notifiakaci pro všechny sledující uživatele
  //, že tento uživatel přidal nový komentář k anime
  const notification = {
        _id: new mongoose.Types.ObjectId(),
        user: user._id,
        action: { rated: id },
        timestamp: timeNow,
  };
  const notificationPayload = await User.populate(notification, {
    path: 'user', select: '_id username profileId'
  })
  
  await User.updateMany(
    { _id: { $in: user.followers } },
    { $push: { notifications: notification } }
  );

  return notificationPayload;
}
const commentExists = async (userId, animeId) => {
  const existingComment = await Comment.findOne({user: userId, animeId})
  return existingComment
}

const getUserComments = async (userId) => {
  const comments = await Comment.find({user: userId})
  return comments;
}
const deleteCommentById = async (commentId, userId) => {
  const result = await Comment.deleteOne({_id: commentId, user: userId})
  if(result.deletedCount === 0){
    throw new Error('Comment not found or you do not have permission to delete it')
  }
}

module.exports = {getUserComments,commentExists, createComment, editComment, deleteCommentById}