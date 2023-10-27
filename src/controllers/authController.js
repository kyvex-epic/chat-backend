/**
 * @fileOverview authController.js
 * @description Controller for authentication related operations (token validation, password reset, etc.)
 * @module authController.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const {User} = require('../models/userModel');
const {logger} = require('../utilities/logger');

// Middleware for bearer token validation
const validateBearerToken = (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // Verify and decode the token
    try {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) return res.status(401).json({error: 'Token validation failed'});

            // Check if the user exists
            const user = await User.findById(decoded.userId);
            if (!user) return res.status(401).json({error: 'User not found'});

            // Attach the user object to the request for future use
            req.user = user;
            next();
        });
    } catch (error) {
        logger.error(`Error validating token: ${error}`);
        logger.error(error.stack);
        return res.status(500).json({ error: 'Token validation failed' });
    }
};

// Middleware for checking if a user is authenticated
const checkAuthentication = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

module.exports = { validateBearerToken, checkAuthentication };



