const User = require('../../mongoose/schemas/user')

const activeUserConnections = new Map();

const connectUser = (userId, res) => {
  activeUserConnections.set(userId, res)
}
const disconnectUser = (userId, res) => {
  if(activeUserConnections.get(userId) === res) {
    activeUserConnections.delete(userId)
  }
}
const notifyUser = (id, data) => {
  const userId = id.toString();
  const res = activeUserConnections.get(userId)
  if(res){
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }
}
const getUserNotifications = async (userId) => {
  const userNotificationsObject = await User.findOne({ _id: userId }).select('notifications').populate({path: 'notifications.user', select: '_id username profileId'}).lean()
  const notifications = userNotificationsObject.notifications;
  const sortedNotifications = notifications.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())
  return sortedNotifications;
}
const deleteNotifications = async (notificationIds, userId) => {
  // Zkontroluje, zda notificationIds je pole, pokud ne, převede ho na pole
  // Slouží pro znovupoužitelnost, protože někdy je posíláno jen jedno id někdy všechny
  const notifIds = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
  await User.updateOne({_id: userId}, {
    $pull: {notifications: {_id: {$in: notifIds}}}
  })
}
module.exports = {deleteNotifications,getUserNotifications,notifyUser,disconnectUser,connectUser}