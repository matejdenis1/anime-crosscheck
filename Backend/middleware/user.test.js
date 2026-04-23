
const jwt = require('jsonwebtoken')
const UserService = require('../service/users/users')
jest.mock('jsonwebtoken');
jest.mock('../service/users/users')

const UserMiddleware = require('./user')

describe('UserMiddleware', () => {
    let req,res;
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            cookies: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        next = jest.fn()
        jest.clearAllMocks();


    })
    describe('verifyToken', () => { 
        it('should return 401 when no cookie is provided', async () => {
            await UserMiddleware.verifyToken(req,res,next);
            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith({message: 'No token provided!'}
            )
        })

        it('should return 401 when token is not valid token', async () => {
            const invalidToken = '123456asds4ada48gr5dfg13g'
            const mockError = new Error('jwt malformed')
            req.cookies.token = invalidToken
             jwt.verify.mockImplementation((token, secret, callback) => {
                callback(mockError, null);
            });
            await UserMiddleware.verifyToken(req,res,next)
            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.send).toHaveBeenCalledWith({auth: false, message: 'Failed to authenticate token.'})
        })

        it('should decode token and set userId', async () => {
            const mockToken = 'valid.jwt.token';
            const mockDecoded = { id: 'user123'};
            
            req.cookies = { token: mockToken };

            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, mockDecoded); 
            });

            await UserMiddleware.verifyToken(req,res,next)

            expect(req.params.userId).toBe('user123'); 
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        })
     })
     describe('getUserById', () => { 
        it('should return 404 and message when user was not found', async () => {
            req.params.userId = '123123425'
            UserService.getUserById.mockResolvedValue(null)
            await UserMiddleware.getUserById(req,res,next)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({message: `User not found for userId: 123123425`})
        })
        it('should return 500 and message when fetching user fails', async () => {
            const mockError = new Error('Database error')
            UserService.getUserById.mockRejectedValue(mockError);
            await UserMiddleware.getUserById(req,res,next)
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message: mockError.message})
        })
        it('should set user', async () => {
            const mockUser = {
                id: '123',
                username: 'test'
            }
            UserService.getUserById.mockResolvedValue(mockUser)
            await UserMiddleware.getUserById(req,res,next)

            expect(req.user).toBe(mockUser); 
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        })
    })




    describe('getUserByProfileId', () => { 
        it('should return 404 and message when user was not found', async () => {
            req.params.profileId = '123123425'
            UserService.getUserByProfileId.mockResolvedValue(null)
            await UserMiddleware.getUserByProfileId(req,res,next)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({message: `User not found for profileId: 123123425`})
        })

        it('should return 500 and message when fetching user fails', async () => {
            const mockError = new Error('Database error')
            UserService.getUserByProfileId.mockRejectedValue(mockError);
            await UserMiddleware.getUserByProfileId(req,res,next)
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message: mockError.message})
        })
        
        it('should set user', async () => {
            const mockUser = {
                id: '123',
                username: 'test'
            }
            UserService.getUserByProfileId.mockResolvedValue(mockUser)
            await UserMiddleware.getUserByProfileId(req,res,next)

            expect(req.user).toBe(mockUser); 
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        })
    })
 })