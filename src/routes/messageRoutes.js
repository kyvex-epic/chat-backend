const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validateBearerToken, checkAuthentication } = require('../controllers/authController');

router.post('/:guildId/:channelId/create', validateBearerToken, checkAuthentication, messageController.createMessage);
router.get('/:guildId/:channelId/:messageId', validateBearerToken, checkAuthentication, messageController.getMessage);
router.delete('/:guildId/:channelId/:messageId/delete', validateBearerToken, checkAuthentication, messageController.deleteMessage);

module.exports = { router, path: '/message', name: 'Message' };
