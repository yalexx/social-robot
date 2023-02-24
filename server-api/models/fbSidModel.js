"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let random = require('mongoose-simple-random');
exports.fbSidSchema = new mongoose.Schema({
    facebookID: String,
    name: String,
    familyName: String,
    userUrl: String,
    country: String,
    parseDate: Date,
    groupName: String,
    groupID: String,
    friendsParsed: Date
}, { collection: 'fbSIDS' });
exports.fbSidSchema.plugin(random);
exports.fbSidModel = mongoose.model('fbSidModel', exports.fbSidSchema);
//# sourceMappingURL=fbSidModel.js.map