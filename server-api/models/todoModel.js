"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let TodoSchema = new mongoose.Schema({
    name: String,
    completed: Boolean,
    note: String,
    updated_at: {
        type: Date,
        default: Date.now
    },
});
exports.TodoModel = mongoose.model('TodoModel', TodoSchema);
//# sourceMappingURL=todoModel.js.map