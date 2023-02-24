"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
exports.TaskSchema = new mongoose.Schema({
    name: String,
    routine: String,
    state: String,
    sids: Array,
    sidsUsed: Array,
    startSidsCount: Number,
    url: String,
    provider: String,
    type: String,
    skipInvite: Boolean,
    skipLike: Boolean,
    createdOn: Date,
    priority: Boolean,
    country: String,
    updatedOn: Date,
    limitRange: [String],
    dailyLimit: Number,
    actionsToday: Number,
}, { collection: 'tasks' });
exports.TaskModel = mongoose.model('TaskModel', exports.TaskSchema);
//# sourceMappingURL=taskModel.js.map