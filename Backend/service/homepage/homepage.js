const Animes = require("../../mongoose/schemas/animes");
const Comment = require("../../mongoose/schemas/comment");

const createHomepage = async () => {
    const animes = await Animes.find({$or: [{verified: true}, {manualVerification: true}]}).lean();
    if(!animes) return {popularAnimes: [], recentRatings: [], todayReleases: []}
    const comments = await Comment.find().populate('user', 'profileId username').sort({updatedAt: -1})
    const popularAnimes = getPopularAnimes(animes, comments);
    const recentRatings = comments.slice(0,5);
    const todayReleases = getTodayReleases(animes);
    return {popularAnimes, recentRatings, todayReleases}
}
// Bere Anime na základě jejich hodnocení v databázi
const getPopularAnimes = (animes, comments) => {
    const ratingsByAnime = new Map();
    for(const comment of comments){
        if(!ratingsByAnime.has(comment.animeId)){
            ratingsByAnime.set(comment.animeId, [])
        }
        ratingsByAnime.get(comment.animeId).push(comment.rating)
    }
    for(const anime of animes){
        const ratings = ratingsByAnime.get(anime.id)
        if(!ratings || ratings.length === 0) {
            anime.rating = 0
            continue
        }
        //Výpočet průměrného hodnocení pro každý anime
        anime.rating = ratings.reduce((sum, current) => sum + current, 0) / ratings.length
    }
    //Vezmi top 5 anime s nejvyšším průměrným hodnocením
    return animes.sort((a,b) => b.rating - a.rating).slice(0,5);
}
const getTodayReleases = (animes) => {
const today = new Date();
  const todayReleases = animes.filter((anime) => {
    const releaseDate = new Date(anime.episodeDate);
    return releaseDate.getDate() === today.getDate() &&
           releaseDate.getMonth() === today.getMonth() &&
           releaseDate.getFullYear() === today.getFullYear();
  });
  return todayReleases;
}


module.exports = {createHomepage}