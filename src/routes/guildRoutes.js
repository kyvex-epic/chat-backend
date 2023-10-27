const express = require('express');
const router = express.Router();
const guildController = require('../controllers/guildController');
const { validateBearerToken, checkAuthentication } = require('../controllers/authController');

router.post('/create', validateBearerToken, checkAuthentication, guildController.createGuild);
router.get('/:id', validateBearerToken, checkAuthentication, guildController.getGuild);
router.delete('/:id', validateBearerToken, checkAuthentication, guildController.deleteGuild);

module.exports = { router, path: '/guild', name: 'Guild' };
