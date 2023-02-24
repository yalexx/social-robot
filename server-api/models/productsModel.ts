import * as mongoose from "mongoose";

let productSchema = new mongoose.Schema({
    name: String,
    price: Number
}, {collection: 'products'});

export let ProductModel = mongoose.model('ProductModel', productSchema);