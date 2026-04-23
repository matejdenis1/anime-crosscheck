const { default: mongoose } = require('mongoose')
const Animes = require('../../mongoose/schemas/animes')
const User = require('../../mongoose/schemas/user')
const AnimeService = require('./anime')
describe('AnimeService', () => {
    afterEach(async() => {
        await User.deleteMany({})
        await Animes.deleteMany({})
    })
    describe('updateAnimeFavorites', () => {
        it('should return text with excluding anime and update user animes in database', async () => {
            const userId = new mongoose.Types.ObjectId;
            await Animes.create({title: 'Anime-1', id: 'anime-1', verified: true})
            await User.create({_id: userId, type: 'user', animes: []})
            const result = await AnimeService.updateAnimeFavorites({_id: userId, animes: []}, 'anime-1')
            expect(result).toBe("Anime included to your favorites: Anime-1")
        })
        it('should return text with including anime and update user animes in database', async () => {
            const userId = new mongoose.Types.ObjectId;
            await Animes.create({title: 'Anime-1', id: 'anime-1', verified: true})
            await User.create({_id: userId, type: 'user', animes: ['anime-1']})
            const result = await AnimeService.updateAnimeFavorites({_id: userId, animes: ['anime-1']}, 'anime-1')
            expect(result).toBe("Anime excluded from your favorites: Anime-1")
        }) 
    })
    describe('getRecommendedAnimes', () => { 
        it('should return animes that are not in ids and have some of the genres', async () => {
            await Animes.create({title: 'Anime-1', id: 'anime-1', genres: ['test','test2'], verified: true})
            await Animes.create({title: 'Anime-2', id: 'anime-2', genres: ['test', 'test3'], verified: true})
            await Animes.create({title: 'Anime-3', id: 'anime-3', genres: ['test1','test','test3'], verified: true})
            const animeIds = ['anime-1', 'anime-2'];
            const result = await AnimeService.getRecommendedAnimes(animeIds)
            expect(result).not.toBeUndefined()
            expect(result.length).toBe(1)
        })
    })
})