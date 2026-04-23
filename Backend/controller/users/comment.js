const CommentService = require('../../service/users/comment')
const NotificationsService = require('../../service/users/notifications')

const { validationResult } = require('express-validator');

//Přidání komentáře
const addRating = async (req,res) => {
  const errors = validationResult(req);
  try{
    if(!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()})
    }
    const user = req.user;
    const form = {...req.body};
    const {animeId} = form;

    if(animeId === undefined) return res.status(400).json({message: 'No animeId provided!'})
    //Jestli komentář už existuje, tak ho upravíme, jinak vytvoříme nový
    const existingComment = await CommentService.commentExists(user._id, animeId)
    if(existingComment){
      await CommentService.editComment(existingComment, form)
      return res.status(200).json({message: 'Rating edited successfully!'})
    } else{
      //Zasiláme notifikace všem followerům, že uživatel přidal nový komentář
      const notification = await CommentService.createComment(form, user)
      for(const follower of user.followers){
        NotificationsService.notifyUser(follower._id, notification)
      }
      return res.status(200).json({message: 'Rating created successfully!'})
    }
  } catch(err){
    console.error(err)
    return res.status(500).json({message: err.message})
  }
}
//Smazání komentáře
const deleteCommentById = async (req,res) => {
  try{
    const user = req.user;
    const commentId = req.params.id;
    await CommentService.deleteCommentById(commentId, user._id);
    return res.status(200).json({message: 'Comment deleted successfully!'})
  } catch(err){
    console.log(err)
    return res.status(500).json({message: err.message})
  }
}
module.exports = {addRating,deleteCommentById}