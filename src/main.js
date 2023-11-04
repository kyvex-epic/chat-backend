/**
 * @name main.js
 * @description Main entry point for Kyvex Chat Backend
 *              This file is used to start the server and load all API routes and etc.
 */



require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const {Logger, logger} = require('./utilities/logger');
const chalk = require('chalk');

const bodyParser = require('body-parser');
const { connect } = require('./utilities/database');

const loggers = {
    requests: new Logger('requests'),
    websocket: new Logger('websocket'),
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

logger.separator();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

async function main() {
    const routes = require('./routes');

    io.on('connection', (socket) => {
        loggers.websocket.log(`SUCCESS`, `New websocket connection from ${socket.handshake.address}`)
        socket.on("subscribe", (topics) => {

            if (typeof topics === 'string') topics = [topics];

            for (const topic of topics) {
                socket.join(topic);
                loggers.websocket.log(`SUCCESS`, `${socket.handshake.address} subscribed to ${topic}`)
            }
        });

        socket.on("unsubscribe", (topic) => {
            socket.leave(topic);
        });


    });

    app.use('/', routes);

    try {
        await connect();
    } catch (err) {
        logger.log(`ERROR`, `${err.message}`)
        return logger.log(`ERROR`, `${err.stack}`)
    }

    server.listen(process.env.PORT, () => {
        logger.log(`SUCCESS`, `Server started on port ${process.env.PORT}`)
        logger.log(`SUCCESS`, `Websocket started on port ${process.env.PORT}`)
    });

}




// On request
app.use((req, res, next) => {

    const colours = {
        GET: chalk.hex('#000000').bgHex('#44B0FF').bold,
        POST: chalk.hex('#000000').bgHex('#07D58C').bold,
        PUT: chalk.hex('#000000').bgHex('#3FB5FF').bold,
        DELETE: chalk.hex('#FFFFFF').bgHex('#FF383B').bold,
        PATCH: chalk.hex('#FFFFFF').bgHex('#FF9F1C').bold,
    }

    loggers.requests.log(`INFO`, `${colours[req.method](req.method)} ${req.originalUrl}`)
    next();

});

main().catch(err => {
    logger.log(`ERROR`, `${err.message}`)
    logger.log(`ERROR`, `${err.stack}`)
})

// Prevent the server from crashing on errors
process.on('unhandledRejection', (error, promise) => {
    logger.log(`ERROR`, `Unhandled rejection, reason: ${error}`)
    logger.log(`ERROR`, `Stack: ${error.stack}`)
});

process.on('uncaughtException', (error, promise) => {
    logger.log(`ERROR`, `Uncaught exception, reason: ${error}`)
    logger.log(`ERROR`, `Stack: ${error.stack}`)
});


module.exports = { io };
