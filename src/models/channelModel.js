const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({

    // Basic information
    name: {type: String, required: true},
    description: {type: String, default: ""},
    guild: {type: mongoose.Schema.Types.ObjectId, ref: 'Guild', required: true},
    messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
    pinned_messages: [{type: mongoose.Schema.Types.ObjectId, ref: 'Message'}],
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Channel', default: null},
    children: [{type: mongoose.Schema.Types.ObjectId, ref: 'Channel'}],
    type: {type: String, enum: ['text', 'forum', 'announcement', 'media', 'category'], default: 'text'},

    // Meta
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    last_message: {type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null},
    disabled: {type: Boolean, default: false},
    archived: {type: Boolean, default: false},
    deletable: {type: Boolean, default: true},

    // Moderation
    slowmode: {type: Number, default: 0}, // Seconds
    nsfw: {type: Boolean, default: false},
    auto_archive: {type: Number, default: 0} // Hours

});


const Channel = mongoose.model('Channel', channelSchema);
module.exports = {Channel};
