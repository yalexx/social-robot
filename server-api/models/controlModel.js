"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.ControlSchema = new mongoose.Schema({
    SIDId: mongoose.Schema.Types.ObjectId,
    containerID: String,
}, { collection: 'control' });
exports.ControlModel = mongoose.model('ControlModel', exports.ControlSchema);
//# sourceMappingURL=controlModel.js.map