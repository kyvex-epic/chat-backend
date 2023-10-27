/**
 * @fileOverview userController.js
 * @description Controller for user related operations. user/
 * @module userController.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const {User} = require('../models/userModel');
const {logger} = require('../utilities/logger');
const {generateProfileImg} = require('../utilities/profileGenerator');

function removeSensitiveData(user) {
    const blacklist = ['password', 'token', '__v', 'two_factor_enabled', 'two_factor_secret', 'last_ip', 'devices',
        'last_seen']
    for (const key in user) if (blacklist.includes(key)) user[key] = undefined;
    return user;
}

// POST user/register
const userRegistration = async (req, res) => {

    let {username, display_name, password} = req.body;

    // Validate the request
    if (!username || !display_name || !password) {
        return res.status(400).json({
            error:
                `All fields are required. `
                + `You are missing ${!username ? 'username' : !display_name ? 'display_name' : 'password'}`
        });
    }

    // Check if the username is already taken
    const existingUser = await User.findOne({username});
    if (existingUser) return res.status(400).json({error: 'Username already taken'});

    // Validate the password (passwords are hashed when saved to the database)
    if (password.length < 8) return res.status(400).json({error: 'Password must be at least 8 characters long'});


    try {

        // Generate a profile picture for the user
        const profileImg = await generateProfileImg(username);

        // Validate and create a new user
        const newUser = new User({username, display_name, password, profile_img: profileImg});

        // Generate a JWT token for the new user
        const token = jwt.sign({userId: newUser.id}, process.env.JWT_SECRET, {expiresIn: '1w'});
        newUser.token = token;

        await newUser.save();
        res.status(200).json({token, user: newUser});

    } catch (error) {
        res.status(500).json({error: 'Registration failed'});
        logger.error(`Error registering user: ${error}`);
        logger.error(error.stack)
    }
};

// POST user/login
const userLogin = async (req, res) => {

    const {username, password} = req.body;

    // Validate the request
    if (!username || !password) return res.status(400).json({error: 'All fields are required'});

    try {
        // Check if the username is already taken
        const existingUser = await User.findOne({username});
        if (!existingUser) return res.status(400).json({error: 'Invalid username or password'});

        // Validate the password
        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) return res.status(400).json({error: 'Invalid username or password'});

        // Generate a JWT token for the user
        const token = jwt.sign({userId: existingUser.id}, process.env.JWT_SECRET, {expiresIn: '1w'});
        existingUser.token = token;

        await existingUser.save();
        res.status(200).json({token, user: existingUser});

    } catch (error) {
        res.status(500).json({error: 'Login failed'});
        logger.error(`Error logging in user: ${error}`);
        logger.error(error.stack)
    }
};

// POST user/logout
const userLogout = async (req, res) => {

    const {userId} = req.body;

    try {

        // Check if the user exists
        const existingUser = await User.findOne({_id: userId});
        if (!existingUser) return res.status(400).json({error: 'Invalid user'});

        // Remove the token
        existingUser.token = null;

        await existingUser.save();
        res.status(200).json({message: 'Logout successful'});

    } catch (error) {
        res.status(500).json({error: 'Logout failed'});
        logger.error(`Error logging out user: ${error}`);
        logger.error(error.stack)
    }
};

// GET  user/:username
const getUserByUsername = async (req, res) => {

    const {username} = req.params;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({username});
        if (!existingUser) return res.status(400).json({error: 'Invalid user'});

        if (req.user.username !== username) return res.status(200).json({user: removeSensitiveData(existingUser)});
        else res.status(200).json({user: existingUser});

    } catch (error) {
        res.status(500).json({error: 'Failed to get user'});
        logger.error(`Error getting user: ${error}`);
        logger.error(error.stack)
    }
}

// GET  user/:userId
const getUserById = async (req, res) => {

    const {userId} = req.params;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({_id: userId});
        if (!existingUser) return res.status(400).json({error: 'Invalid user'});

        res.status(200).json({user: removeSensitiveData(existingUser)});
    } catch (error) {
        res.status(500).json({error: 'Failed to get user'});
        logger.error(`Error getting user: ${error}`);
        logger.error(error.stack)
    }
}

// DELETE  user/:userId
const deleteUser = async (req, res) => {

    const {userId} = req.params;

    try {
        // Check if the user exists
        const existingUser = await User.findOne({_id: userId});
        if (!existingUser) return res.status(400).json({error: 'Invalid user'});

        // Check if the user is the owner of the account
        if (req.user.username !== existingUser.username) return res.status(403).json({error: 'You are not the owner of this account'});

        await existingUser.delete();
        res.status(200).json({message: 'User deleted'});
    } catch (error) {
        res.status(500).json({error: 'Failed to delete user'});
        logger.error(`Error deleting user: ${error}`);
        logger.error(error.stack)
    }
}



module.exports = {userRegistration, userLogin, userLogout, getUserById, getUserByUsername, deleteUser};
