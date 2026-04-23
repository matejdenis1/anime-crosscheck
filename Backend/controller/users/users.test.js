jest.mock('../../service/users/users')
jest.mock('../../service/users/auth')
const UserController = require('../../controller/users/users')
const UserService = require('../../service/users/users')
const AuthService = require('../../service/users/auth')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
jest.mock('express-validator', () => ({
    validationResult: jest.fn(),
    body: jest.fn()
}))

describe('UserController', () => {
    let req,res
    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: {}
        }
        validationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => []
        })
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    })
    describe('editUser', () => {
        it('should return 400 if body is invalid', async () => {
            validationResult.mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'oldPassword is required', param: 'oldPassword' }]
            })
            await UserController.editUser(req,res)
            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith({errors: [{ msg: 'oldPassword is required', param: 'oldPassword' }]})
        })
        it('should return 200 if username is changed', async () => {
            req.body = { username: 'new-username' }
            await UserController.editUser(req,res)
            expect(UserService.updateUser).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message: 'Username successfully changed!', update: 'username'})
        })
        it('should return 403 if old password is wrong', async () => {
            req.body = {newPassword: 'new-password', oldPassword: 'wrong-password' }
            AuthService.checkPassword.mockResolvedValue(false)
            await UserController.editUser(req,res)
            expect(res.status).toHaveBeenCalledWith(403)
            expect(AuthService.hashPassword).toHaveBeenCalledTimes(0);
            expect(res.json).toHaveBeenCalledWith({message: 'Wrong old password'})
        })
        it('should return 200 if password is changed', async () => {
            req.body = { oldPassword: 'old-password', newPassword: 'new-password' }
            AuthService.checkPassword.mockResolvedValue(true)
            AuthService.hashPassword.mockResolvedValue('new-hash')
            await UserController.editUser(req,res)
            expect(AuthService.checkPassword).toHaveBeenCalledTimes(1);
            expect(AuthService.hashPassword).toHaveBeenCalledTimes(1);
            expect(UserService.updateUser).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({message: 'Password successfully changed!', update: 'password'})
        })
    })
    describe('updateFollows', () => {
        it('should return 403 if user is trying to follow himself', async () => {
            req.user = { profileId: 'test-profile-id' }
            req.params.profileId = 'test-profile-id'
            await UserController.updateFollows(req,res)
            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.json).toHaveBeenCalledWith({message: 'You cannot follow yourself!'})
        })
        it('should return 404 if user is not found', async () => {
            req.user = { profileId: 'test-profile-id-user' }
            req.params.profileId = 'test-profile-id-follow'
            UserService.getUserByProfileId.mockResolvedValue(null)
            await UserController.updateFollows(req,res)
            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith({message: 'User not found for profileId: test-profile-id-follow'})
        })
        it('should return 201 if user is unfollowed', async () => {
            const userId = new mongoose.Types.ObjectId()
            const followId = new mongoose.Types.ObjectId()
            req.user = {_id: userId, profileId: 'test-profile-id-user', follows: [{_id: followId}] }
            req.params.profileId = 'test-profile-id-follow'
            const follow = {_id: followId, profileId: 'test-profile-id-follow', username: 'test-username-follow'}

            UserService.getUserByProfileId.mockResolvedValue(follow)
            await UserController.updateFollows(req,res)
            expect(UserService.removeFollow).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(201)

            expect(res.json).toHaveBeenCalledWith({message: `${follow.username} was excluded from your follows!`})
        })
        it('should return 201 if user is followed', async () => {
            const userId = new mongoose.Types.ObjectId()
            const followId = new mongoose.Types.ObjectId()
            req.user = {_id: userId, profileId: 'test-profile-id-user', follows: [] }
            req.params.profileId = 'test-profile-id-follow'
            const follow = {_id: followId, username: 'test-username-follow'}
            UserService.getUserByProfileId.mockResolvedValue(follow)
            UserService.addFollow.mockResolvedValue()
            await UserController.updateFollows(req,res)
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith({message: `${follow.username} was included to your follows!`})
            expect(UserService.addFollow).toHaveBeenCalledTimes(1);
        })
    })
})