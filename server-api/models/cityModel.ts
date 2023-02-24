import * as mongoose from "mongoose";

let CitySchema = new mongoose.Schema(
    {
        name: String,
        location: Array
    }, {collection: 'city'});

export let CityModel = mongoose.model('CityModel', CitySchema);