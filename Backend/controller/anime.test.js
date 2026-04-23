
jest.mock('../service/anime/anime');

const AnimeController = require('./anime')
const AnimeService = require('../service/anime/anime')
const { validationResult } = require('express-validator')

jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
    body: jest.fn()
}))
describe('AnimeController', () => {
    let req,res;
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {}
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    })
    describe('getAnimesForValidation', () => {
        const mockAnimes = [
                {title: 'Anime 1', id: 'anime-1', verified: false},
                {title: 'Anime 2', id: 'anime-2', verified: false},
                {title: 'Anime 3', id: 'anime-3', verified: false},
        ]
        it('should return 200 with animes list', async () => {
            req.user.type = 'moderator'
            const mockBody = {
                id: 'anime-1',
                title: 'Anime-1',
                verified: false,
            }
            req.body = mockBody;

            validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
            })

            AnimeService.getAnimesForValidation.mockResolvedValue(mockAnimes)

            await AnimeController.getAnimesForValidation(req,res)

            expect(AnimeService.getAnimesForValidation).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockAnimes)
        })
        it('should return 403 when user is not type of moderator', async () => {
            req.user.type = 'user';
            const mockBody = {
                id: 'anime-1',
                title: 'Anime-1',
                verified: false,
            }
            req.body = mockBody;

            validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
            })
            AnimeService.getAnimesForValidation.mockResolvedValue(mockAnimes)

            await AnimeController.getAnimesForValidation(req,res)
            expect(AnimeService.getAnimesForValidation).toHaveBeenCalledTimes(0);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({message: 'Permission Denied'});
        })
        it('should return 500 when something fails on service layer', async () => {
            req.user.type = 'moderator'

            const mockBody = {
                id: 'anime-1',
                title: 'Anime-1',
                verified: false,
            }
            req.body = mockBody;

            validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
            })

            const error = new Error('Database error')
            
            AnimeService.getAnimesForValidation.mockRejectedValue(error)

            await AnimeController.getAnimesForValidation(req,res)
            expect(AnimeService.getAnimesForValidation).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({message: error.message});
        })
     })
     describe('verifyAnime', () => {
        const validBody = {
                id: 'anime-1',
                title: 'Anime-1',
                verified: false,
            }
        const validValidation = () => validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
        })
        it('should return 200 and message', async () => {
            req.user.type = 'moderator'
            const mockBody = validBody

            req.body = mockBody;

            validValidation();

            AnimeService.verifyAnime.mockResolvedValue({...mockBody, verified: true})
            await AnimeController.verifyAnime(req,res)

            expect(AnimeService.verifyAnime).toHaveBeenCalledTimes(1)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message: mockBody.title+' verified successfully!'})
            
        })
        it('should return 400 and error message when body failed validation', async () => {
            const mockBody = {
                id: 'anime-1',
                verified: false
            }
            req.body = mockBody;

            const arrayMessage = [{msg: 'Title is required', param: 'title', location: 'body'}]

            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => arrayMessage
            })

            await AnimeController.verifyAnime(req,res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                errors: arrayMessage
            })
            expect(AnimeService.verifyAnime).not.toHaveBeenCalled()

        })
        it('should return 403 when user is not type of moderator', async () => {
            req.user.type = 'user';
            const mockBody = validBody

            req.body = mockBody;

            validValidation();

            await AnimeController.verifyAnime(req,res)

            expect(AnimeService.verifyAnime).toHaveBeenCalledTimes(0);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({message: 'Permission Denied'});
        })
        it('should return 500 when something fails on service layer', async () => {
            req.user.type = 'moderator'
            const error = new Error('Database error')
            
            const mockBody = validBody

            req.body = mockBody;

            validValidation();

            AnimeService.verifyAnime.mockRejectedValue(error)

            await AnimeController.verifyAnime(req,res)

            expect(AnimeService.verifyAnime).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({message: error.message});
        })
     }) 
})
