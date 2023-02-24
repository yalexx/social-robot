import * as mongoose from "mongoose";

export let TaskSchema = new mongoose.Schema(
    {
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
    }, {collection: 'tasks'});

export let TaskModel = mongoose.model('TaskModel', TaskSchema);