const Animes = require('../../mongoose/schemas/animes')
const Comment = require('../../mongoose/schemas/comment')

const verifyAnime = async (animeForm) => {
    const anime = await Animes.findOne({id: animeForm.id})
    if(!anime) throw new Error('Anime with for id '+animeForm.id+' not found!')
    animeForm.genres = typeof animeForm.genres === 'string' && animeForm.genres.length > 0
        ? animeForm.genres.split(",")
        : (anime.genres || []);
    animeForm.manualVerification = true;
    Object.assign(anime, animeForm);
    return await anime.save();
}
const getAnimesForValidation = async () => {
    const animes = await Animes.find({manualVerification: false, verified: false})
    return animes;
}
const getUsersAnimes = async (animeIds) => {
    const animes = await Animes.find({id: {$in: animeIds}, $or: [{manualVerification: true}, {verified: true}]})
    return animes;
}
const getVerifiedAnimes = async () => {
    const animes = await Animes.find({$or: [{manualVerification: true}, {verified: true}]})
    return animes;
}
const getAnimeById = async (id) => {
    const anime = await Animes.findOne({id, $or: [{manualVerification: true}, {verified: true}]})
    if(!anime) throw new Error('Anime with for id '+id+' not found!');
    //Převede Mongoose dokument na obyčejný JavaScript objekt, aby bylo možné přidat nové pole 'comments' a 'rating'.
    const animeDTO = anime.toObject();
    const comments = await Comment.find({animeId: anime.id}).populate('user', 'profileId username')
    animeDTO.comments = comments
    // Vypočítá průměrné hodnocení ze všech komentářů náležících k tomuto anime
    animeDTO.rating = comments.length !== 0 ? comments.map(c => c.rating).reduce((sum, current) => sum + current, 0) / comments.length : 0
    return animeDTO;
} 
module.exports = {verifyAnime, getAnimesForValidation, getUsersAnimes, getVerifiedAnimes, getAnimeById}