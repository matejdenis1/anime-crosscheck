const Comment = require('../mongoose/schemas/comment')
const Animes = require('../mongoose/schemas/animes')
const User = require('../mongoose/schemas/user')

//Volání paralelní synchronizace databáze
const syncDb = async () => {
    await Promise.all([deleteCommentsForRemovedAnimes(), deleteIdsFromUsersAnimes()])
}
//Zjistí aktuální stav anime v databázi a vymaže komentáře k anime,
//která již nejsou v databázi a smaže id anime z uživatelů, pokud již neexistuje
const deleteCommentsForRemovedAnimes = async () => {
    const currentAnimeIds = await Animes.distinct('id')
    const result = await Comment.deleteMany({
        animeId: {$nin: currentAnimeIds}
    })
    return result.deletedCount;
   
}
//Vyčistí pole animes v uživatelích od id anime, které již nejsou v databázi
const deleteIdsFromUsersAnimes = async () => {
    const currentAnimeIds = await Animes.distinct('id')
    await User.updateMany(
        {},
        {$pull: {animes: {$nin: currentAnimeIds}}}
    )
}

module.exports = {syncDb}