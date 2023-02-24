import * as mongoose from "mongoose";

let TodoSchema = new mongoose.Schema({
    name: String,
    completed: Boolean,
    note: String,
    updated_at: {
        type: Date,
        default: Date.now
    },
});

export let TodoModel = mongoose.model('TodoModel', TodoSchema);