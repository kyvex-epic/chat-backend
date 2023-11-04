/**
 * @fileOverview miscController.js
 * @description Controller for miscellaneous operations. misc/
 * @module miscController.js
 */

const { logger } = require('../utilities/logger');
const axios = require('axios');

// GET misc/getPageInfo
const getPageInfo = async (req, res) => {

    const {url} = req.body;

    if (!url) return res.status(400).json({error: 'Missing url query parameter'});

    try {

        const response = await axios.get(url);
        res.status(200).json({data: response.data});

    } catch (error) {

        logger.error(`Error getting page info: ${error}`);
        logger.error(error.stack);
        res.status(500).json({error: 'Failed to get page info'});

    }
}

module.exports = { getPageInfo };
