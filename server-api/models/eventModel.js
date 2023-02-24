"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.EventSchema = new mongoose.Schema({
    type: String,
    date: Date,
    success: Boolean,
    provider: String,
    id: String,
}, { collection: 'events' });
exports.EventModel = mongoose.model('EventModel', exports.EventSchema);
//# sourceMappingURL=eventModel.js.map