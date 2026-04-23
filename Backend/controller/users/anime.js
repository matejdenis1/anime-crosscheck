const AnimeService = require('../../service/users/anime')
const { validationResult } = require('express-validator')

//Aktualizuje oblíbená anime uživatele a vrátí zprávu pro zobrazení na frontendu
const updateAnimeFavorites = async (req,res) => {
  try{
    const user = req.user;
    const animeId = req.params.id
    const message = await AnimeService.updateAnimeFavorites(user, animeId)
    return res.status(200).json({message})
  } catch(err){
    return res.status(500).json({message: `Adding anime failed with error of ${err.message}`})
  }
}
//Vrátí doporučené anime pro uživatele na základě jeho oblíbených anime, které jsou posílány v těle požadavku. 
//Jelikož tento systém funguje i pro nepřihlášené uživatele, musí se posílat tělo s oblíbenými anime, než aby si brali data přímo z databáze
const getRecommendedAnimes = async (req,res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  try{
    const {animes} = req.body
    const recommended = await AnimeService.getRecommendedAnimes(animes)
    return res.status(200).json(recommended)
  } catch(err){
    console.error(err)
    return res.status(500).json({message: err.message})
  }
}
module.exports = {getRecommendedAnimes, updateAnimeFavorites}