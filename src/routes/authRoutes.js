const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('logged-in', authController.checkAuthentication, (req, res) => {
    res.status(200).json({message: 'Logged in'});
});

module.exports = { router, path: '/auth', name: 'Auth' };