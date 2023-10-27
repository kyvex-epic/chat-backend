/**
 * @file models.js
 * @description This file is used to load all models from the models folder
 *              and export them as a single object.
 */

const userModel = require('./userModel');
const guildModel = require('./guildModel');

const models = { userModel, guildModel };
module.exports = models;
