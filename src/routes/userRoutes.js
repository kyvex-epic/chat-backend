const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { validateBearerToken, checkAuthentication } = require('../controllers/authController');

router.post('/register', userController.userRegistration);
router.post('/login', userController.userLogin);
router.post('/logout', validateBearerToken, checkAuthentication, userController.userLogout);

router.get(`/:username`, validateBearerToken, checkAuthentication, userController.getUserByUsername);
router.get(`/id/:userId`, validateBearerToken, checkAuthentication, userController.getUserById);

router.delete(`/:userId`, validateBearerToken, checkAuthentication, userController.deleteUser);


module.exports = { router, path: '/user', name: 'User' };
