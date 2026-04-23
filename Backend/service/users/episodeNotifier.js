const mongoose = require('mongoose')
const Animes = require('../../mongoose/schemas/animes')
const User = require('../../mongoose/schemas/user')
const { notifyUser } = require('./notifications')

let queue = []
let scheduledTimers = []

// Vrací dnešní datum v čase 00:00:00
const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
// Vrací zítřejší datum v čase 00:00:00 
const startOfTomorrow = () => {
  const tomorrow = startOfToday()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

// Zasílám notifikace uživatelům, kteří sledují anime, u kterého má dnes vyjít nový díl
const sendEpisodeNotification = async (entry) => {
  const users = await User.find({ animes: entry.animeId }, '_id').lean()
  if (users.length === 0) return

  const timestamp = new Date()
  const notificationTemplate = {
    action: {
      episode: {
        animeId: entry.animeId,
        title: entry.title,
        episodeNumber: entry.episodeNumber,
        image: entry.image
      }
    },
    timestamp
  }

  const notifications = users.map(u => {
    const notification = { _id: new mongoose.Types.ObjectId(), ...notificationTemplate }
    return { userId: u._id, notification }
  })

  await User.bulkWrite(
    notifications.map(({ userId, notification }) => ({
      updateOne: {
        filter: { _id: userId },
        update: { $push: { notifications: notification } }
      }
    }))
  )

  for (const { userId, notification } of notifications) {
    notifyUser(userId, notification)
  }
}

// Ruší všechny naplánované timery a resetuje jejich pole
const clearScheduledTimers = () => {
  for (const t of scheduledTimers) clearTimeout(t)
  scheduledTimers = []
}

const scheduleEntry = (entry) => {
  // Delay je čas do vydání epizody; pokud je záporný, epizoda už vyšla 
  const delay = entry.episodeDate.getTime() - Date.now()
  if (delay < 0) {
    entry.notified = true
    return
  }
  const timer = setTimeout(async () => {
    if (entry.notified) return
    try {
      entry.notified = true
      await sendEpisodeNotification(entry)
    } catch (err) {
      console.error(`[episodeNotifier] Failed to notify for ${entry.title}:`, err)
    }
  }, delay)


  scheduledTimers.push(timer)
}

// Načte dnešní epizody z DB a znovu naplánuje všechny timery (stará sada se zahodí)
const rebuildQueue = async () => {
  clearScheduledTimers()

  //Filtruje anime, která mají datum vydání mezi dneškem a zítřkem
  const from = new Date()
  const to = startOfTomorrow()
  const animes = await Animes.find(
    { episodeDate: { $gte: from, $lt: to } },
    'id title episodeNumber episodeDate imageVersionRoute'
  ).lean()


  queue = animes
  // Filtruje pouze anime s validními daty a mapuje je do formátu pro notifikace
    .filter(a => a.id && a.episodeDate && typeof a.episodeNumber === 'number')
    .map(a => ({
      animeId: a.id,
      title: a.title,
      episodeNumber: a.episodeNumber,
      episodeDate: new Date(a.episodeDate),
      image: a.imageVersionRoute || null,
      notified: false
    }))
    .sort((a, b) => a.episodeDate - b.episodeDate)

  //Vytváří nové timery pro všechny epizody v queue
  for (const entry of queue) scheduleEntry(entry)
}

module.exports = { rebuildQueue }
