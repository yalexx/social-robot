"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let random = require('mongoose-simple-random');
exports.SidSchema = new mongoose.Schema({
    type: String,
    provider: String,
    isUsed: Boolean,
    isVerified: Boolean,
    country: String,
    gender: String,
    name: String,
    familyName: String,
    zip: Number,
    city: String,
    street: String,
    streetNumber: Number,
    day: Number,
    month: Number,
    year: Number,
    registerEmail: String,
    registerPassword: String,
    haveProfilePhoto: Boolean,
    cookie: String,
    verificationDate: Date,
    haveInitialLikes: Number,
    facebookID: String,
    latLng: Object,
    lastLogin: Date,
    haveCoverPhoto: Boolean,
    haveInitialFriends: Number,
    sidID: Number,
    sidVerify: Boolean,
    loginSend: Date,
    likes: Number,
    favorites: mongoose.Schema.Types.ObjectId,
    group: Number,
    groupInvited: Number
}, { collection: 'sids' });
exports.SidSchema.plugin(random);
exports.SidModel = mongoose.model('SidModel', exports.SidSchema);
//# sourceMappingURL=sidModel.js.map