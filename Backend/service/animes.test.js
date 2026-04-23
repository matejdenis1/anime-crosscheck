const Comment = require('../mongoose/schemas/comment')
const Animes = require('../mongoose/schemas/animes')
const User = require('../mongoose/schemas/user')
const mongoose = require('mongoose')

const RoutineService = require('./animes')
describe('RoutineService', () => {
    const userId = new mongoose.Types.ObjectId
    beforeAll(async () => {
        await User.create([
        {_id: userId, profileId: 'user1', animes: ['anime-5', 'anime-1', 'anime-2'] ,username: 'user1', type: 'testUser' },
        ])

        await Animes.create([
        { title: 'Anime 1', id: 'anime-1' , verified: true, episodeDate: new Date()}, 
        { title: 'Anime 2', id: 'anime-2' , verified: true, episodeDate: new Date()}, 
        { title: 'Anime 3', id: 'anime-3' , verified: true, episodeDate: new Date('2024-01-01')}, 
        { title: 'Anime 4', id: 'anime-4' , verified: true, episodeDate: new Date('2024-01-01')},   
        ]);

        await Comment.create([
        { animeId: 'anime-1', animeName: 'Anime 1', rating: 5, user: userId, message: 'Great', updatedAt: new Date() },
        { animeId: 'anime-2', animeName: 'Anime 2', rating: 3, user: userId, message: 'Mid',updatedAt: new Date('2026-01-01') },
        { animeId: 'anime-3', animeName: 'Anime 3', rating: 2, user: userId, message: 'Worse',updatedAt: new Date() },
        { animeId: 'anime-5', animeName: 'Anime 5', rating: 2, user: userId, message: 'Worse',updatedAt: new Date() }
        ])
    })
    describe('deleteCommentsForRemovedAnimes', () => { 
        it('should delete all comments that are not in anime list', async () => {
            const result = await RoutineService.syncDb();
            const newCommentsCount = await Comment.countDocuments({})
            expect(newCommentsCount).toBe(3)
        })
    })
    describe('deleteIdsFromUsersAnimes', () => { 
        it('should remove animeIds from users animes list', async () => {
            const result = await RoutineService.syncDb();
            const user = await User.findOne();
            const animesCount = user.animes.length
            expect(animesCount).toBe(2)
        })
     })
    
})
