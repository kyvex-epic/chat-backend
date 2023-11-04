/**
 * @fileOverview messageController.js
 * @description Controller for message related operations. message/
 * @module messageController.js
 */
const { io } = require('../main.js');
const {User} = require('../models/userModel');
const {Guild} = require('../models/guildModel');
const {Channel} = require('../models/channelModel');
const {Message} = require('../models/messageModel');
const {logger} = require('../utilities/logger');

// POST message/:guildId/:channelId/create
const createMessage = async (req, res) => {

    const {guildId, channelId} = req.params;
    const {content} = req.body;

    if (!content) {
        return res.status(400).json({
            error:
                `All fields are required. `
                + `You are missing ${!content ? 'content' : ''}`
        });
    }

    try {

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({error: 'Channel not found'});

        // CHeck if the user is a member of the guild
        if (!guild.members.some(member => member.toString() === req.user._id.toString())) return res.status(403).json({error: 'You are not a member of this guild'});

        const message = new Message({
            content,
            channel: channel._id,
            author: req.user._id
        });

        await message.save();
        res.status(201).json({message});

    } catch (error) {
        res.status(500).json({error: 'Error creating message'});
        logger.error(`Error creating message: ${error}`);
        logger.error(error.stack);
    }
}

// GET message/:guildId/:channelId/:messageId
const getMessage = async (req, res) => {

    const {guildId, channelId, messageId} = req.params;

    try {

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({error: 'Channel not found'});

        if (!guild.members.some(member => member.toString() === req.user._id.toString())) return res.status(403).json({error: 'You are not a member of this guild'});

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({error: 'Message not found'});

        res.status(200).json({message});
    } catch (error) {
        res.status(500).json({error: 'Error getting message'});
        logger.error(`Error getting message: ${error}`);
        logger.error(error.stack);
    }
}

// DELETE message/:guildId/:channelId/:messageId
const deleteMessage = async (req, res) => {

    const {guildId, channelId, messageId} = req.params;
    const { io } = require('../main.js');

    try {

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        if (!guild.members.some(member => member.toString() === req.user._id.toString())) return res.status(403).json({error: 'You are not a member of this guild'});

        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({error: 'Channel not found'});

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({error: 'Message not found'});

        // Check if the user is the author of the message or the owner of the guild
        if (req.user._id.toString() !== message.author.toString()
            && req.user._id.toString() !== guild.owner.toString()) {
            return res.status(403).json({error: 'You are not the author of this message or the owner of this guild'});
        }

        await Message.deleteOne({_id: messageId});

        io.to(channel._id.toString()).emit('messageDelete', messageId);

        res.status(200).json({message: 'Message deleted'});
    } catch (error) {
        res.status(500).json({error: 'Error deleting message'});
        logger.error(`Error deleting message: ${error}`);
        logger.error(error.stack);
    }
}

module.exports = {createMessage, getMessage, deleteMessage};
