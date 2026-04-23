require('dotenv').config()
// Jednoduchá funkce pro zpoždění (rate limiting)
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}


//Fetchování anime z AnimeSchedule API
const getAllAnimesFromAnimeSchedule = async () => {
  try {
        const response = await fetch('https://animeschedule.net/api/v3/timetables/sub', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.ANIME_SCHEDULE_TOKEN}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const animes = await response.json();
        await delay(1000)

        //
        // Načte detail ke každému anime pro získání dalších informací
        // Chyba u jednoho anime nezahodí celé pole, jen daný záznam přeskočí
        //
        for(const anime of animes){
          anime.imageVersionRoute = "https://img.animeschedule.net/production/assets/public/img/"+anime.imageVersionRoute
          try {
            const detail = await fetch("https://animeschedule.net/api/v3/anime/"+anime.route, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.ANIME_SCHEDULE_TOKEN}`,
                    'Content-Type': 'application/json',
                }
            })
            if (!detail.ok) {
                console.error('Failed to fetch anime details for ' + anime.title + " with error " + detail.statusText);
                continue;
            }
            const fetchedAnime = await detail.json();
            anime.genres = fetchedAnime.genres?.flatMap((genre) => genre.name) ?? [];
            anime.description = fetchedAnime.description?.replace(/<[^>]*>/g, '');
            anime.status = fetchedAnime.status;
          } catch(detailErr){
            console.error('Error fetching detail for ' + anime.title + ':', detailErr.message);
          }
          await delay(500)
        }
        console.log("[fetchers] Fetching animes from AnimeSchedule completed!")
        return animes.filter(a => a.status !== "Finished")
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

//Fetchování anime z Jikan API
//Vytváří 7 requestů pro každý den v týdnu a ostatní kategorie
const getAllAnimesFromJikan = async () => {

  const jikanAnimes = []
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday", "unknown","other"];
  for(const day of days){
    try{
      const res = await fetch("https://api.jikan.moe/v4/schedules/"+day)
      if(res.status !== 200){
        await delay(60000)
        const retry = await fetch("https://api.jikan.moe/v4/schedules/"+day)
        if(retry.status !== 200){
          console.error("Jikan retry failed for day "+day+" with status "+retry.status)
          continue;
        }
        const animes = await retry.json();
        jikanAnimes.push(...animes.data)
      } else{
        
        const animes = await res.json();
        jikanAnimes.push(...animes.data)
      }
      await delay(1500)
    }
    catch(err){
      console.error("Error while fetching data for day "+day, err)
    }
  }
  console.log("[fetchers] Fetching animes from Jikan completed!");
  return jikanAnimes.map(anime => {
    return {
      title: anime?.titles?.[0]?.title,
      romaji: anime?.title,
      english: anime?.title_english,
      native: anime?.title_japanese,
      description: anime?.synopsis,
    }
  })
}
//Vytváří GraphQL dotaz pro získání všech anime z AniListu, které jsou aktuálně vysílány.
const getAllAnimesFromAniList = async () => {
  const allAnimes = [];
  let page = 1;
  let hasNextPage = true;

  // AniList API vrací data po stránkách, tento loop pokračuje, dokud nejsou načteny všechny stránky
  while(hasNextPage){
    const response = await fetch('https://graphql.anilist.co', {
    // POST Request jelikož posíláme GraphQL dotaz v těle požadavku
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
                      query: `
                        query ($page: Int) {
                          Page(page: $page, perPage: 50) {
                            pageInfo {
                              hasNextPage
                            }
                            media(status: RELEASING, type: ANIME, format_in: [TV, TV_SHORT, OVA, ONA], sort: POPULARITY_DESC, isAdult: false) {
                              id
                              title {
                                romaji
                                english
                                native
                              }
                              description(asHtml: false)
                              coverImage{
                              large
                              }
                              episodes
                              nextAiringEpisode {
                                airingAt
                                episode
                              }
                              genres
                            }
                          }
                        }
                      `,
                      variables: { page }
                    })
  });
  const data = await response.json()
  if(data.errors){
    console.error('Error: ', data.errors);
    break;
  }
  allAnimes.push(...data.data.Page.media)
  hasNextPage = data.data.Page.pageInfo.hasNextPage;
  page++;

  if(hasNextPage){
    await delay(1000);
    }
  }

  console.log("[fetchers] Fetching animes from AniList completed!")
  return allAnimes.map(anime => {
    return {
      id: anime.id,
      title: anime.title.romaji ? anime.title.romaji : anime.title.english,
      romaji: anime.title?.romaji,
      english: anime.title?.english,
      native: anime.title?.native,
      description: anime?.description,
      imageVersionRoute: anime.coverImage?.large,
      episodeNumber: anime.nextAiringEpisode?.episode,
      episodeDate: anime.nextAiringEpisode?.airingAt,
      genres: anime?.genres
    }
  }).filter(anime => anime.episodeNumber)
}

module.exports = { getAllAnimesFromAnimeSchedule, getAllAnimesFromJikan, getAllAnimesFromAniList };