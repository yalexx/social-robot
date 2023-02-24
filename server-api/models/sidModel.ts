import * as mongoose from "mongoose";

let random = require('mongoose-simple-random');

export let SidSchema = new mongoose.Schema(
    {
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
    }, {collection: 'sids'});

SidSchema.plugin(random);

export let SidModel = mongoose.model('SidModel', SidSchema);