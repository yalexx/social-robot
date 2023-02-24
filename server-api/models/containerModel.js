"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ContainerSchema = new mongoose.Schema({
    id: String,
    routine: String,
    paused: Boolean,
    connected: Boolean,
    hostname: String
}, { collection: 'containers' });
exports.ContainerModel = mongoose.model('ContainerModel', exports.ContainerSchema);
//# sourceMappingURL=containerModel.js.map