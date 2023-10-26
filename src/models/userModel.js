/**
 * @name userModel.js
 * @description User model
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({

    // Basic information
    username: {type: String, required: true, unique: true, index: true},
    display_name: {type: String, required: true},
    password: {type: String, required: true},

    // Things
    // TODO: Uncomment these when the models are created
    // messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
    // guilds: [{type: Schema.Types.ObjectId, ref: 'Guild'}],
    // friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    // friend_requests: [{type: Schema.Types.ObjectId, ref: 'User'}],

    // Meta
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now},
    disabled: {type: Boolean, default: false},

    // Customization
    profile_img: {type: Buffer, default: null},
    banner_img: {type: Buffer, default: null},
    status: {type: String, default: "offline", enum: ["online", "offline", "idle", "dnd"]},
    status_text: {type: String, default: ""},
    pronouns: {type: String, default: ""},
    about_me: {type: String, default: ""},
    last_seen: {type: Date, default: Date.now},

    verified: {type: Boolean, default: false},
    partner: {type: Boolean, default: false},

    // Security
    two_factor_enabled: {type: Boolean, default: false},
    two_factor_secret: {type: String, default: null},
    last_ip: {type: String, default: null},
    devices: [{type: String, default: null}],

    // Site-wide permissions
    admin: {type: Boolean, default: false},
    developer: {type: Boolean, default: false},
    contributor: {type: Boolean, default: false},
    site_admin: {type: Boolean, default: false},
    site_moderator: {type: Boolean, default: false},

    // Badges
    badges: [{type: String, default: null, enum: ["verified", "partner", "developer", "contributor", "admin", "moderator"]}],

});

const UserModel = mongoose.model('User', userSchema);

module.exports = { UserModel };





