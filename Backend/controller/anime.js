const AnimeService = require('../service/anime/anime')
const {validationResult} = require('express-validator')

//Metoda určená pro moderátory, kteří ověřují anime, které přidali uživatelé. 
const verifyAnime = async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
     try{
        const animeForm = {...req.body}
        const user = req.user;
        if(user.type !== 'moderator') return res.status(403).json({message: 'Permission Denied'})
        const response = await AnimeService.verifyAnime(animeForm)
        if(response) return res.status(200).json({message: `${animeForm.title} verified successfully!`})
    } catch(err){
        return res.status(500).json({message: err.message})
    }
}
const getAnimesForValidation = async (req,res) => {
    try{
        const user = req.user;
        if(user.type !== 'moderator') return res.status(403).json({message: 'Permission Denied'})
        const animes = await AnimeService.getAnimesForValidation();
        res.status(200).json(animes)
    } catch(err){
        res.status(500).json({message: err.message})
    }
}
//Metoda pro zobrazneí detailů anime, které se zobrazí po kliknutí na název anime v seznamu.
const getAnimeById = async (req,res) => {
    try{
        const id = req.params.id
        const anime = await AnimeService.getAnimeById(id)
        res.status(200).json({...anime});
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}
//Získá všechny ověřené anime, které se zobrazí v seznamu na /layout a /animes na FE.
const getVerifiedAnimes = async (req,res) => {
    try{
        const animes = await AnimeService.getVerifiedAnimes();
        res.status(200).send(animes)
    } catch(err){
        res.status(500).json({message: err.message})
    }
}
module.exports = {getVerifiedAnimes, getAnimeById, getAnimesForValidation, verifyAnime}