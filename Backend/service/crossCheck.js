const Animes = require("../mongoose/schemas/animes");
const { getAllAnimesFromAnimeSchedule, getAllAnimesFromAniList, getAllAnimesFromJikan } = require("./fetchers");
const Fuse = require('fuse.js');

// Zkontroluje, zda jsou URL obrázků validní, pokud ne, nahradí je obrázkem z AniListu
const checkImages = async ({matched, aniList}) => {
  for(const anime of matched){
    try{
      const response = await fetch(anime.imageVersionRoute, {method: 'HEAD'})
      if(!response.ok){
        anime.imageVersionRoute = aniList.find(a => a.title === anime.title).imageVersionRoute
      }
    } catch(err){
      console.error(err.message)
    }
  }
  return matched
}
// Vytvoří Fuse instanci pro danou kolekci anime
const createFuse = (from) => {
  const fuse = new Fuse(from, {
    keys: ['title', 'native', 'romaji', 'english'],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 3
  });
  return fuse;
}

//Hledá ve Fuse anime se shodným názvem
const findMatch = (anime, fuse) => {
    //Filtruje všechny možné nastavené názvy anime
    const titles = [anime?.romaji,anime?.english,anime?.native,anime?.title].filter(Boolean);
    for (const title of titles) {
      const results = fuse.search(title);
      if (results.length > 0 && results[0].score < 0.4) {
        return results[0].item;
      }
    }
    return null;
};


// Tato funkce kontroluje a cross-referencuje anime data z Jikanu, AniListu a AnimeSchedule
// I když jedno ze zdrojů odpadne stále projde cross-checkem a ověří anime, pokud se shoduje alespoň ve dvou zdrojích, ale stejně jsou považovány pouze za parciální shodné
const crossCheck = async ({animeSchedule, jikan, aniList}) => {
 
  // Vybere jenom ty zdroje, které mají data a nejsou prázdné
  const crossCheckCollection = [animeSchedule, jikan, aniList].filter(Boolean).filter(s => s.length > 0)

  //Iniciální naplnění pole "matched" z prvního zdroje, všechny anime jsou považovány za ověřené 1 zdrojem
  let matched = [...crossCheckCollection[0].map(anime => ({...anime, verificationCount: 1}) )]
  let unmatched = [];
  //Metoda projde všechny zbývající zdroje a porovná je s již "matched" anime, pokud najde shodu, aktualizuje data a zvýší "verificationCount", 
  // pokud nenajde, přidá anime do pole "unmatched" pro další porovnání
  for(let i = 1; i < crossCheckCollection.length; i++){
    const newUnMatched = [];
    const fuse = createFuse(matched);
    const alreadyMatched = new Set();
    crossCheckCollection[i].forEach(anime => {
    const match = findMatch(anime, fuse);
    if(match){
        const matchedAnime = matched.find(m => m === match);
        if(alreadyMatched.has(matchedAnime.title)){
          return;
        }
        alreadyMatched.add(matchedAnime.title);
        matchedAnime.verificationCount += 1;
        for(const key of Object.keys(anime)){
          if(key === 'description') continue;
          //Jestli není nastavený klíč v "matchedAnime" a je nastavený v "anime", aktualizuje ho
          if(!matchedAnime[key] && anime[key]){
            matchedAnime[key] = anime[key];
          }
        }
        //Speciální případ pro "description", protože často bývá neúplný, aktualizuje ho jenom pokud je delší než ten stávající
        if((matchedAnime.description?.length ?? 0) < (anime.description?.length ?? 0)){
          matchedAnime.description = anime.description.replace(/<[^>]*>/g, '').trim();
        }
    } else{
      newUnMatched.push(anime)
    }}
  );
  // Pokud po porovnání s aktuálním "matched" polem zůstanou nějaké "unmatched" anime, zkusí je porovnat mezi sebou navzájem, 
  // jestli nenajde shodu alespoň ve dvou zdrojích, ale stejně jsou považovány pouze za parciální shodné
  if(unmatched.length > 0){
    const unmatchedFuse = createFuse(unmatched);
    crossCheckCollection[i].forEach(anime => {
      const match = findMatch(anime, unmatchedFuse);
      if(match){
        anime.verificationCount = 2;
        matched.push(anime);
      }
    })
  }
  unmatched = [...newUnMatched];

  }

  // Finální zahození anime, které nemají shodu alespoň ve dvou zdrojích
  const final = matched.filter(anime => anime.verificationCount >= 2);
  final.forEach(anime => {
    anime.verified = anime.verificationCount === 3;
  })
  const animes = await module.exports.checkImages({matched: final, aniList});
  return {animes};
};

const getAnimes = async () => {
  const [animeSchedule, aniList, jikan] = await Promise.all([
    getAllAnimesFromAnimeSchedule(),
    getAllAnimesFromAniList(), 
    getAllAnimesFromJikan(), 
  ])

  const {animes} = await crossCheck({animeSchedule,aniList, jikan})

  // Tato metoda provádí "upsert" operaci pro každé anime v "animes" poli, což znamená, že pokud anime s daným názvem již existuje v databázi, aktualizuje jeho data,
  // a pokud neexistuje, vytvoří nový záznam. Pole "filter" určuje kritéria pro hledání existujícího záznamu (v tomto případě název anime)
  await Animes.bulkWrite(
    animes.map(anime => {
      anime.id = anime.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').
      replace(/\s+/g, '-').replace(/-+/g, '-');
      const { episodeNumber, episodeDate, verified,status,imageVersionRoute,description,
         ...insertAnime} = anime; 
      return ({
        updateOne: {
        filter: { title: anime.title },
        update: {
          // Aktualizuje pouze dynamické údaje, nebo údaje které se mohou změnit
          $set: {
            imageVersionRoute: imageVersionRoute,
            episodeNumber: episodeNumber,
            episodeDate: episodeDate,
            verified: verified,
            status: status,
            description: description
          },
          $setOnInsert: {...insertAnime}
      },
        upsert: true
    }})}))
  
  console.log("[crossCheck] All animes fetched successfully!")
  // Smaže anime, která nejsou v posledním stažení (ochrana proti vymazání dat při prázdném poli)
  if(animes.length > 0){
    await Animes.deleteMany({title: {$nin: animes.map(a => a.title)}})
  }
  
}

module.exports = {getAnimes, findMatch, createFuse, crossCheck, checkImages}