jest.mock('../../service/users/comment')
jest.mock('../../service/users/notifications')
const CommentService = require('../../service/users/comment')
const CommentController = require('../../controller/users/comment')


describe('CommentController', () => {
    let req,res
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
            cookie: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    })
    describe('addRating', () => { 
        it('should return 200 with message when rating exists', async () => {
            req.body.animeId = 'anime-1'
            CommentService.commentExists.mockResolvedValue({_id: 123, message: 'Test'})
            CommentService.editComment.mockResolvedValue({_id: 123, message: 'Test2'})
            await CommentController.addRating(req,res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message: 'Rating edited successfully!'})
        })
        it('should return 200 with message when rating does not exist', async () => {
            req.user.followers = []
            req.body.animeId = 'anime-1'
            CommentService.commentExists.mockResolvedValue(null)
            CommentService.editComment.mockResolvedValue({_id: 123, message: 'Test2'})
            await CommentController.addRating(req,res)
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message: 'Rating created successfully!'})
        })
        it('should return 400 with message if no animeId is provided', async () => {
            await CommentController.addRating(req,res);
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({message: 'No animeId provided!'})
        })
     })
 })