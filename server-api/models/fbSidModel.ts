import * as mongoose from "mongoose";
let random = require('mongoose-simple-random');

export let fbSidSchema = new mongoose.Schema(
    {
        facebookID: String,
        name: String,
        familyName: String,
        userUrl: String,
        country: String,
        parseDate: Date,
        groupName: String,
        groupID: String,
        friendsParsed: Date
    }, {collection: 'fbSIDS'});

fbSidSchema.plugin(random);

export let fbSidModel = mongoose.model('fbSidModel', fbSidSchema);