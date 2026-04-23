const NotificationsService = require('../../service/users/notifications')

const deleteNotifications = async (req,res) => {
  try{
    const {ids} = req.body;
    const user = req.user;  
    await NotificationsService.deleteNotifications(ids, user._id)
    return res.status(200).json({success: true})
  }catch(err){
    console.error(err)
    return res.status(500).json({message: err.message})
  }
}
const getUserNotifications = async (req,res) => {
  try{
    const userId = req.params.userId;
    const notifications = await NotificationsService.getUserNotifications(userId);
    return res.status(200).json({notifications})
  } catch(err){
    return res.status(500).json({message: err.message})
  }
}
//Inicializace SSE připojení pro uživatele
const manageNotificationConnection = (req,res) => {
    const userId = req.params.userId
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      'connection': 'keep-alive',
    });
    NotificationsService.connectUser(userId, res);
    req.on('close', () => {
      NotificationsService.disconnectUser(userId, res)
    })
}

module.exports = {deleteNotifications,manageNotificationConnection,getUserNotifications}