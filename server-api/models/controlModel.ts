import * as mongoose from "mongoose";

export let ControlSchema = new mongoose.Schema(
    {
        SIDId: mongoose.Schema.Types.ObjectId,
        containerID: String,
    }, {collection: 'control'});

export let ControlModel = mongoose.model('ControlModel', ControlSchema);