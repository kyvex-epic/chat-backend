const express = require('express');
const router = express.Router();
const channelController = require('../controllers/channelController');
const { validateBearerToken, checkAuthentication } = require('../controllers/authController');

router.post('/:guildId/create', validateBearerToken, checkAuthentication, channelController.createChannel);
router.get('/:guildId/:channelId', validateBearerToken, checkAuthentication, channelController.getChannel);
router.delete('/:guildId/:channelId', validateBearerToken, checkAuthentication, channelController.deleteChannel);

module.exports = { router, path: '/channel', name: 'Channel' };
