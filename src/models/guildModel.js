/**
 * @name guildModel.js
 * @description Guild model
 */

const mongoose = require('mongoose');
const {Channel} = require("./channelModel");

const guildSchema = new mongoose.Schema({

    // Basic information
    name: {type: String, required: true},
    description: {type: String, default: ""},

    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    channels: [{type: mongoose.Schema.Types.ObjectId, ref: 'Channel'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
    invites: [{type: mongoose.Schema.Types.ObjectId, ref: 'Invite'}],

    // Meta
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    disabled: {type: Boolean, default: false},
    verified: {type: Boolean, default: false},
    partner: {type: Boolean, default: false},

    // Customization
    icon: {type: Buffer, default: null},
    banner: {type: Buffer, default: null},
    splash: {type: Buffer, default: null},
    vanity_url: {type: String, default: null},
    private: {type: Boolean, default: false}

});

// On created, add the owner to the members list and add the guild to the owner's guilds list
guildSchema.pre('save', async function (next) {
    const {User} = require('./userModel');

    if (this.isNew) {
        this.members.push(this.owner);
        const owner = await User.findById(this.owner);
        owner.guilds.push(this._id);
        await owner.save();

        if (!this.channels.some(channel => channel.name === 'Uncategorised')) {
            const {Channel} = require('./channelModel');

            const uncategorised = new Channel({
                name: 'Uncategorised',
                description: 'The default channel for this guild',
                guild: this._id,
                created_by: this.owner,
                type: 'category',
                deletable: false
            });

            await uncategorised.save();
            this.channels.push(uncategorised);
        }

    }
    next();
});


const Guild = mongoose.model('Guild', guildSchema);
module.exports = {Guild};
