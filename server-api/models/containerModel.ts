import * as mongoose from "mongoose";
export let ContainerSchema = new mongoose.Schema(
    {
        id: String,
        routine: String,
        paused: Boolean,
        connected: Boolean,
        hostname: String
    }, {collection: 'containers'});

export let ContainerModel = mongoose.model('ContainerModel', ContainerSchema);