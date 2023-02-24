import * as mongoose from "mongoose";
export let EventSchema = new mongoose.Schema(
    {
        type: String,
        date: Date,
        success: Boolean,
        provider: String,
        id: String,
    }, {collection: 'events'});

export let EventModel = mongoose.model('EventModel', EventSchema);