"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let productSchema = new mongoose.Schema({
    name: String,
    price: Number
}, { collection: 'products' });
exports.ProductModel = mongoose.model('ProductModel', productSchema);
//# sourceMappingURL=productsModel.js.map