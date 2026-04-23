const User = require('../../mongoose/schemas/user')
const Animes = require('../../mongoose/schemas/animes')

//Zkontroluje, zda pole mají nějaké společné prvky
const containsSome = (a,b) => {
  return b.some(x => a.includes(x))
}
//Seřadí anime podle nejčastějších výskytů žánru
const sortByMostCommonGenres = (animes, genres) => {
  let countBoard = []
  for (const anime of animes){
    let count = 0;
    for(const genre of anime.genres){
      if(genres.includes(genre)){
        count++;
      }
    }
    countBoard.push({anime, count})
  }
  return countBoard.sort((a,b) => b.count - a.count).map(entry => entry.anime)
}

const getGenresFromAnimes = (animes) => {
  const genres = animes.flatMap(anime => anime.genres);
  const uniqueGenres = [...new Set(genres)];
  return uniqueGenres;
}
const getGenresForUserAnimes = async (animeIds) => {
  const animes = await Animes.find({id: {$in: animeIds}, $or: [{manualVerification: true}, {verified: true}]});
  const genres = getGenresFromAnimes(animes);
  return genres
}
const getRecommendedAnimes = async (userAnimesIds) => {
   const animes = await Animes.find({$or: [{verified: true}, {manualVerification: true}]});
   const userAnimes = animes.filter(anime => userAnimesIds.includes(anime.id))
   const genres = getGenresFromAnimes(userAnimes)
   const notFavorite = animes.filter((a) => !userAnimesIds.includes(a.id));
   //Získá 5 anime, která nejsou v oblíbených uživatele a obsahují alespoň jeden žánr z oblíbených anime uživatele
   const animesContainingGenre = (notFavorite.filter((a) => containsSome(genres, a.genres)))
   const recommended = sortByMostCommonGenres(animesContainingGenre, genres).splice(0,5);
   return recommended;
}
const updateAnimeFavorites = async (user, animeId) => {
  const anime = await Animes.findOne({id: animeId, $or: [{manualVerification: true}, {verified: true}]})
  if(!anime) throw new Error('Anime with given id not found')
  const isAnimeInUserFavorites = user.animes.includes(animeId)
  if(isAnimeInUserFavorites){
      await User.updateOne({_id: user._id}, {$pull: {animes: animeId}})
      return 'Anime excluded from your favorites: '+anime.title
    }
  else{
      await User.updateOne({_id: user._id}, {$addToSet: {animes: animeId}})
      return 'Anime included to your favorites: '+anime.title
    }
}
module.exports = {updateAnimeFavorites, getRecommendedAnimes, getGenresForUserAnimes}