jest.mock('../../service/users/auth')
jest.mock('../../service/users/users')

const { validationResult } = require('express-validator');
jest.mock('express-validator');

const AuthService = require('../../service/users/auth')
const UserService = require('../../service/users/users')

const AuthController = require('../../controller/users/auth')

describe('AuthController', () => { 
    let req,res;
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {}
        };
        validationResult.mockReturnValue({
                isEmpty: () => true,
                array: () => []
        });
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            cookie: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    })
    describe('loginUser', () => {
        it('should return 400 if body is invalid' , async () => {
            req.body = { email: 'invalid-email' };
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [
                    { msg: 'Valid email is required', param: 'email' }
                ]
            });
            await AuthController.registerUser(req,res);
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).not.toBeUndefined()
        }) 
        it('should return 404 and message if user not found for email', async () => {
            AuthService.findUserByEmail.mockResolvedValue(null)
            await AuthController.loginUser(req,res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({message: 'Bad credentials!'})
            expect(AuthService.checkPassword).toHaveBeenCalledTimes(0)
        })
        it('should return 404 and message if password does not match', async () => {
            AuthService.findUserByEmail.mockResolvedValue({_id: 123})
            AuthService.checkPassword.mockResolvedValue(false)
            await AuthController.loginUser(req,res)
            expect(AuthService.checkPassword).toHaveBeenCalledTimes(1)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({message: 'Bad credentials!'})
        })
        it('should return 500 and message if database error', async () => {
            const error = new Error('Database error')
            AuthService.findUserByEmail.mockRejectedValue(error);
            await AuthController.loginUser(req,res)
            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({message: error.message})
        })
        it('should return 200 and set cookies when everything passes', async () => {
            AuthService.findUserByEmail.mockResolvedValue({_id: 123})
            AuthService.checkPassword.mockResolvedValue(true)
            AuthService.createToken.mockResolvedValue('djasiodjaiod123')

            await AuthController.loginUser(req,res);
            expect(res.json).toHaveBeenCalledWith({auth: true, message: 'Login successful.. Welcome!'})
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.cookie).not.toBeUndefined()
        })
     })
     describe('registerUser', () => {
        it('should return 400 if body is invalid' , async () => {
            req.body = { email: 'invalid-email' };
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [
                    { msg: 'Valid email is required', param: 'email' }
                ]
            });
            await AuthController.registerUser(req,res);
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).not.toBeUndefined()
        }) 
        it('should return 409 if email exists', async () => {
            req.body = {
                username: 'username',
                email: 'email',
                profileId: 'profileId'
            }
            AuthService.profileIdExists.mockResolvedValue(false)
            AuthService.emailExists.mockResolvedValue(true)
            await AuthController.registerUser(req,res);
            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith({email: "Email is already taken!"})
        })
        it('should return 200 and set cookies', async () => {
            req.body = {
                username: 'username',
                email: 'email',
                profileId: 'profileId'
            }
            AuthService.profileIdExists.mockResolvedValue(false)
            AuthService.emailExists.mockResolvedValue(false)
            AuthService.createUser.mockResolvedValue({_id: 123})
            AuthService.createToken.mockResolvedValue('SDJIOJDAsd21345')
            
            await AuthController.registerUser(req,res);
            expect(res.json).toHaveBeenCalledWith({message: 'You have been successfully registered!', created: true})
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.cookie).not.toBeUndefined()
        })
    })
 })