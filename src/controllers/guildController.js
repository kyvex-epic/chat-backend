/**
 * @fileOverview guildController.js
 * @description Controller for guild related operations. guild/
 * @module guildController.js
 */

const {User} = require('../models/userModel');
const {Guild} = require('../models/guildModel');
const {logger} = require('../utilities/logger');
const {generateProfileImg} = require('../utilities/profileGenerator');

// POST guild/create
const createGuild = async (req, res) => {

    let {name, description} = req.body;

    // Validate the request
    if (!name) {
        return res.status(400).json({
            error:
                `All fields are required. `
                + `You are missing ${!name ? 'name' : 'description'}`
        });
    }

    try {

        // Generate a profile picture for the guild
        const profileImg = await generateProfileImg(name);

        // Validate and create a new guild
        const newGuild = new Guild({name, description, icon: profileImg, owner: req.user._id});

        await newGuild.save();
        res.status(200).json({guild: newGuild});

    } catch (error) {
        res.status(500).json({error: 'Guild creation failed'});
        logger.error(`Error creating guild: ${error}`);
        logger.error(error.stack);
    }

}

// GET guild/:id
const getGuild = async (req, res) => {

    const {id} = req.params;
    if (!id) return res.status(400).json({error: 'Missing Guild ID'});

    try {
        const guild = await Guild.findById(id);
        if (!guild) return res.status(404).json({error: 'Guild not found'});

        res.status(200).json({guild});
    } catch (error) {
        res.status(500).json({error: 'Error getting guild'});
        logger.error(`Error getting guild: ${error}`);
        logger.error(error.stack);
    }
}

// DELETE guild/:id
const deleteGuild = async (req, res) => {

    const {id} = req.params;
    if (!id) return res.status(400).json({error: 'Missing Guild ID'});

    try {
        const guild = await Guild.findById(id);
        if (!guild) return res.status(404).json({error: 'Guild not found'});
        if (guild.owner.toString() !== req.user._id.toString()) return res.status(403).json({error: 'You are not the owner of this guild'});

        await guild.delete();
        res.status(200).json({message: 'Guild deleted'});
    } catch (error) {
        res.status(500).json({error: 'Error deleting guild'});
        logger.error(`Error deleting guild: ${error}`);
        logger.error(error.stack);
    }
}

module.exports = { createGuild, getGuild, deleteGuild };
