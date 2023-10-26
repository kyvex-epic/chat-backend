/**
 * @fileoverview Database utilities.
 * @description  This file contains functions that are used to interact, connect, and disconnect from the database.
 * @module utilities/database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { logger } = require('./logger');

const mongoDb = {
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    database: process.env.MONGO_DB
}


/**
 * @name connect
 * @desc Connect to the database
 * @return {Promise} A promise that resolves when the database is connected
 */
async function connect() {
    const uri = `mongodb://${mongoDb.host}:${mongoDb.port}/${mongoDb.database}`;

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    return mongoose.connection;

}

/**
 * @name disconnect
 * @desc Disconnect from the database
 * @return {Promise} A promise that resolves when the database is disconnected
 */

async function disconnect() {
    return await mongoose.disconnect();
}

const events = [
    ['connecting', `Connecting to database @ ${mongoDb.host}:${mongoDb.port}`, 'INFO'], ['connected', 'Connected to database', 'SUCCESS'],
    ['disconnecting', 'Disconnecting from database...', 'INFO'], ['disconnected', 'Disconnected from database', 'SUCCESS'],
    ['error', 'Error connecting to database', 'ERROR']
];

events.forEach(event => { mongoose.connection.on(event[0], () => { logger.log(event[2], event[1]) }) });


module.exports = { connect, disconnect }
