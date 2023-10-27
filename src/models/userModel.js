/**
 * @name userModel.js
 * @description User model
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({

    // Basic information
    username: {type: String, required: true, unique: true, index: true},
    display_name: {type: String, required: true},
    password: {type: String, required: true},
    token: {type: String, default: null},

    // Things
    // TODO: Uncomment these when the models are created
    messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
    guilds: [{type: Schema.Types.ObjectId, ref: 'Guild'}],
    friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
    friend_requests: [{type: Schema.Types.ObjectId, ref: 'User'}],

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
    badges: [{type: String, default: null, enum: ["verified", "partner", "developer", "contributor", "admin", "moderator",
    "early_supporter", "bug_hunter"]}],

});

// Give the user the Early Supporter badge if they are one of the first 100 users
userSchema.pre('save', async function(next) {
    const User = mongoose.model('User');
    const userCount = await User.countDocuments();
    if (userCount < 100) this.badges.push("early_supporter");

    // If the password is being changed, hash it
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
    }
    
    next();
});


const User = mongoose.model('User', userSchema);
module.exports = { User };
