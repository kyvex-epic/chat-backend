/**
 * @name messageModel.js
 * @description Message model
 */

const mongoose = require('mongoose');
const {io} = require("../main");

const messageSchema = new mongoose.Schema({

    // Basic information
    content: {type: String, required: true},
    content_history: [{type: String}],
    channel: {type: mongoose.Schema.Types.ObjectId, ref: 'Channel', required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    attachments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'}],

    // Meta
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},

    // Moderation
    nsfw: {type: Boolean, default: false}

});

// On created, add the message to the channel's messages list
messageSchema.pre('save', async function (next) {
    const { io } = require('../main.js');
    const {Channel} = require('./channelModel');

    if (this.isNew) {
        const channel = await Channel.findById(this.channel);
        channel.messages.push(this._id);
        await channel.save();

        io.to(channel._id.toString()).emit('message', this);

    }
    next();
});

// On deleted
messageSchema.pre('remove', async function (next) {

    const { io } = require('../main.js');
    const {Channel} = require('./channelModel');
    console.log('message deleted');
    console.log(this);

    const channel = await Channel.findById(this.channel);

    io.to(channel._id.toString()).emit('messageDelete', this._id);

    next();

});



const Message = mongoose.model('Message', messageSchema);
module.exports = {Message};
