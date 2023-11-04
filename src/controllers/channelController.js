/**
 * @fileOverview channelController.js
 * @description Controller for channel related operations. channel/
 * @module guildController.js
 */

const {User} = require('../models/userModel');
const {Guild} = require('../models/guildModel');
const {Channel} = require('../models/channelModel');
const {Message} = require('../models/messageModel');
const {logger} = require('../utilities/logger');

// POST /channel/:guildId/create
const createChannel = async (req, res) => {

    const { name, type } = req.body;
    const { guildId } = req.params;

    if (!name || !type) {
        return res.status(400).json({
            error:
                `All fields are required. `
                + `You are missing ${!name ? 'name' : 'type'}`
        });
    }

    try {

        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        if (guild.owner.toString() !== req.user._id.toString()) return res.status(403).json({error: 'You are not the owner of this guild'});


        const channel = new Channel({
            name,
            type,
            guild: guild._id,
            created_by: req.user._id
        });

        await channel.save();
        guild.channels.push(channel._id);
        await guild.save();

        res.status(200).json({channel});

    } catch (error) {

        res.status(500).json({error: 'Error creating channel'});
        logger.error(`Error creating channel: ${error}`);
        logger.error(error.stack);

    }

}

// GET /channel/:guildId/:channelId
const getChannel = async (req, res) => {

    const {guildId, channelId} = req.params;

    try {
        // Check if the user is in the guild
        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});
        if (!guild.members.includes(req.user._id)) return res.status(403).json({error: 'You are not in this guild'});

        const channel = await Channel.findById(channelId);
        if (!channel) return res.status(404).json({error: 'Channel not found'});

        // Limit the number of messages returned to 150
        channel.messages = await Message.find({channel: channel._id}).sort({created_at: -1}).limit(150).populate('author');

        res.status(200).json({channel});
    } catch (error) {
        res.status(500).json({error: 'Error getting channel'});
        logger.error(`Error getting channel: ${error}`);
        logger.error(error.stack);
    }
}

// DELETE /channel/:guildId/:channelId
const deleteChannel = async (req, res) => {

    const {guildId, channelId} = req.params;

    try {
        const guild = await Guild.findById(guildId);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        if (guild.owner.toString() !== req.user._id.toString()) return res.status(403).json({error: 'You are not the owner of this guild'});
        if (!guild.channels.includes(channelId)) return res.status(404).json({error: 'Channel not found'});
        guild.channels = guild.channels.filter(channel => channel.toString() !== channelId);
        await guild.save();

        res.status(200).json({message: 'Channel deleted'});
    } catch (error) {
        res.status(500).json({error: 'Error deleting channel'});
        logger.error(`Error deleting channel: ${error}`);
        logger.error(error.stack);
    }
}




module.exports = { createChannel, getChannel, deleteChannel };