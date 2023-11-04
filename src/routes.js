/**
 * @module routes
 * @description This module is used to load all API routes
 */

const { Logger } = require('./utilities/logger');
const chalk = require('chalk');

const express = require('express');

const router = express.Router();
const routeLogger = new Logger('routes');

const routes = [
    require('./routes/userRoutes'),
    require('./routes/guildRoutes'),
    require('./routes/channelRoutes'),
    require('./routes/messageRoutes'),
    require('./routes/miscRoutes'),
]

routeLogger.info(chalk.green('Loading routes...'));

routes.forEach(route => {
    router.use(route.path, route.router);
    routeLogger.success(chalk.green(`Loaded ${route.name} routes`));
});


routeLogger.separator()


module.exports = router;
