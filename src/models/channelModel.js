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
    position: {type: Number, default: 0},

    channelHash: {type: String, default: null},

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

// If position is not specified, set it to the last position
channelSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastChannel = await Channel.findOne({guild: this.guild}).sort({position: -1});
        if (lastChannel) this.position = lastChannel.position + 1;
        console.log(this.guild)

        const { io } = require('../main.js');
        io.to(this.guild._id.toString()).emit('channelCreate', this);
    }

    next();
});


const Channel = mongoose.model('Channel', channelSchema);
module.exports = {Channel};
