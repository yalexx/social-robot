import * as mongoose from "mongoose";
import {Schema} from "mongoose";

let RemovedSidsSchema = new mongoose.Schema({
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
    haveInitialLikes: Number,
    facebookID: String,
    latLng: Object,
    lastLogin: Date,
    haveCoverPhoto: Boolean,
    haveInitialFriends: Number,
    removedDate: Date,
    verificationDate: Date,
    sidID: Number,
    sidVerify: Boolean,
    loginSend: Date,
    likes: Number,
    favorites: mongoose.Schema.Types.ObjectId,
}, {collection: 'removedSids'});

export let RemovedSidsModel = mongoose.model('RemovedSidsModel', RemovedSidsSchema);