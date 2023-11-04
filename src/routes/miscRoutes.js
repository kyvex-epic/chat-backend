const express = require('express');
const router = express.Router();
const miscController = require('../controllers/miscController');
const { validateBearerToken, checkAuthentication } = require('../controllers/authController');

router.get('/getPageInfo', validateBearerToken, checkAuthentication, miscController.getPageInfo);

module.exports = { router, path: '/misc', name: 'Misc' };
