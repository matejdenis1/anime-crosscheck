const HomepageService = require('./homepage');
const Animes = require('../../mongoose/schemas/animes'); // Mongoose/ORM model
const Comment = require('../../mongoose/schemas/comment')
const User = require('../../mongoose/schemas/user')
const mongoose = require('mongoose');

require('dotenv').config()

describe('HomepageService', () => {
  beforeAll(async () => {

    const userId = new mongoose.Types.ObjectId;
    const userId2 = new mongoose.Types.ObjectId;
    const userId3 = new mongoose.Types.ObjectId;

    await User.create([
      {_id: userId, profileId: 'user1', username: 'user1', type: 'testUser' },
      {_id: userId2, profileId: 'user2', username: 'user2', type: 'testUser' },
      {_id: userId3, profileId: 'user3', username: 'user3', type: 'testUser' }
    ])

    await Animes.create([
      { title: 'Anime 1', id: 'anime-1' , verified: true, episodeDate: new Date()}, 
      { title: 'Anime 2', id: 'anime-2' , verified: true, episodeDate: new Date()}, 
      { title: 'Anime 3', id: 'anime-3' , verified: true, episodeDate: new Date('2024-01-01')}, 
      { title: 'Anime 4', id: 'anime-4' , verified: true, episodeDate: new Date('2024-01-01')},  
      { title: 'Anime 5', id: 'anime-5' , verified: true, episodeDate: new Date('2024-01-01')},  
    ]);

    await Comment.create([
      { animeId: 'anime-1', animeName: 'Anime 1', rating: 5, user: userId, message: 'Great', updatedAt: new Date() },
      { animeId: 'anime-1', animeName: 'Anime 1', rating: 3, user: userId2, message: 'Mid',updatedAt: new Date('2026-01-01') },
      { animeId: 'anime-2', animeName: 'Anime 2', rating: 2, user: userId, message: 'Worse',updatedAt: new Date() },
      { animeId: 'anime-2', animeName: 'Anime 2', rating: 1, user: userId3, message: 'Bad',updatedAt: new Date() },
      { animeId: 'anime-4', animeName: 'Anime 4', rating: 4, user: userId, message: 'Better',updatedAt: new Date() },
      { animeId: 'anime-4', animeName: 'Anime 4', rating: 2, user: userId3, message: 'Worse',updatedAt: new Date('2024-01-01') },
    ])
    
  })

  describe('createHomepage', () => {
    it('should return animes that are airing today', async () => {
      const result = await HomepageService.createHomepage();
      expect(result.todayReleases).toHaveLength(2)
    })
    it('should return max 5 animes with highest rating', async () => {
      const result = await HomepageService.createHomepage();
      expect(result.popularAnimes.length).toBeLessThanOrEqual(5)
    })
    it('should return max 5 sorted recent comments', async () => {
      const result = await HomepageService.createHomepage();
      const recentRatings = result.recentRatings;
      expect(recentRatings[3].updatedAt >= recentRatings[4].updatedAt).toBe(true)
      expect(recentRatings.length).toBeLessThanOrEqual(5)
      expect(recentRatings)
    })
    it('should return where popular animes have rating as average from all comments', async () => {
      const result = await HomepageService.createHomepage();
      const popularAnimes = result.popularAnimes;

      expect(popularAnimes.every(anime => anime.rating <= 5)).toBe(true) 
      expect(popularAnimes[0].rating).toBe(4)
      expect(popularAnimes[1].rating).toBeCloseTo(3)
      expect(popularAnimes[2].rating).toBe(1.5)
      expect(popularAnimes[3].rating).toBe(0)
      expect(popularAnimes[4].rating).toBe(0)
    })
    it('should return empty arrays for animes when they were not fetched from db', async () => {
      await Animes.deleteMany({})
      const result = await HomepageService.createHomepage();
      expect(result.todayReleases.length).toBe(0)
      expect(result.popularAnimes.length).toBe(0)
      expect(result.recentRatings.length).toBe(5)
    })
  })
})