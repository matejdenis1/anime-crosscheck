const AnimeService = require('./anime');
const Animes = require('../../mongoose/schemas/animes'); // Mongoose/ORM model
const Comment = require('../../mongoose/schemas/comment')
const User = require('../../mongoose/schemas/user')
const mongoose = require('mongoose');

describe('AnimeService', () => {
    const userId = new mongoose.Types.ObjectId()
  beforeAll(async () => {
    await User.create({
        _id: userId,
        profileId: 'test',
        username: 'test',
        type: 'user'
    })
  });

  beforeEach(async () => {
    await Animes.deleteMany({});
    await Animes.create([
      { title: 'Anime 1', id: 'anime-1' ,manualVerification: false, verified: false }, 
      { title: 'Anime 2', id: 'anime-2' ,manualVerification: false, verified: false }, 
      { title: 'Anime 3', id: 'anime-3' ,manualVerification: true, verified: false }, 
      { title: 'Anime 4', id: 'anime-4' ,manualVerification: false, verified: true },  
      { title: 'Anime 5', id: 'anime-5' ,manualVerification: true, verified: true },  
    ]);
  });

  afterEach(async () => {
    await Animes.deleteMany({});
  });


  describe('getAnimesForValidation', () => {
    it('should return only animes with manualVerification=false and verified=false', async () => {
        const result = await AnimeService.getAnimesForValidation();
        expect(result).toHaveLength(2);
        expect(result.every(anime => 
        anime.manualVerification === false && anime.verified === false
        )).toBe(true);
        expect(result.map(a => a.title)).toEqual(
        expect.arrayContaining(['Anime 1', 'Anime 2'])
        );
    });

    it('should return empty array when no animes match criteria', async () => {
        await Animes.deleteMany({});
        await Animes.create({ 
        title: 'Verified Anime',
        id: 'verified-anime',
        manualVerification: false, 
        verified: true 
        });
        
        const result = await AnimeService.getAnimesForValidation();
        
        expect(result).toHaveLength(0);
        expect(result).toEqual([]);
  });
  })
    describe('getUsersAnimes', () => {
        const ids = ['anime-1', 'anime-2', 'anime-3', 'anime-4', 'anime-5']
        it('should return animes based on ids', async () => {
            const result = await AnimeService.getUsersAnimes(ids)
            expect(result).toHaveLength(3);
        })
        it('should return only animes that are manually or automatically verified', async () => {
            const result = await AnimeService.getUsersAnimes(ids)
            expect(result.every(anime => anime.manualVerification === true || anime.verified === true)).toBe(true)
        })
    })
    describe('getVerifiedAnimes', () => { 
        it('should return only animes that are manually or automatically verified', async () => {
            const result = await AnimeService.getVerifiedAnimes();
            expect(result.every(anime => anime.manualVerification === true || anime.verified === true)).toBe(true);
        }) 
    })
    describe('getAnimeById', () => {
        
        const validId = 'anime-3'
        const invalid_noMatch = 'not-anime'
        const invalid_notVerified = 'anime-1'
        
        it('should return DTO type of anime', async () => {
            const result = await AnimeService.getAnimeById(validId)
            expect(typeof result).toMatch('object')
        })
        it('should throw error if anime is not in db', async () => {
            await expect(AnimeService.getAnimeById(invalid_noMatch)).rejects.toThrow(Error);
        })
        it('should throw error if anime is not verified', async () => {
            await expect(AnimeService.getAnimeById(invalid_notVerified)).rejects.toThrow(Error);
        })
        it('should return object with field comments and rating', async () => {
            await Comment.deleteMany({})
            await Comment.create({
                animeId: validId,
                user: userId,
                message: 'Good anime',
                rating: 4,
                updatedAt: new Date(),
                animeName: 'One-Piece'
            })
            const result = await AnimeService.getAnimeById(validId);
            expect(result['comments'] && result['rating']).not.toBeUndefined()
        })
        it('rating should be number', async () => {
            await Comment.deleteMany({})
            await Comment.create({
                animeId: validId,
                user: userId,
                message: 'Good anime',
                rating: 4,
                updatedAt: new Date(),
                animeName: 'One-Piece'
            })
        })
    })
    describe('verifyAnime', () => { 
        it('should return updated anime object', async () => {
            const animeForm = {
                title: 'new title',
                id: 'anime-1',
                genres: 'Genre1,Genre2',
                manualVerification: false,
                verified: false
            }
            const result = await AnimeService.verifyAnime(animeForm)
            expect(result.genres).toEqual(['Genre1','Genre2'])
            expect(result.manualVerification).toBe(true)
            expect(result.title).toMatch(animeForm.title)
        })
        it('should throw error if anime not found in db', async () => {
            const invalidId = 'invalidId'
            await expect(AnimeService.verifyAnime({id: invalidId})).rejects.toThrow(Error);
        })
    })
});