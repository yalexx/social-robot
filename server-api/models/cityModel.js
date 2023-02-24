"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let CitySchema = new mongoose.Schema({
    name: String,
    location: Array
}, { collection: 'city' });
exports.CityModel = mongoose.model('CityModel', CitySchema);
//# sourceMappingURL=cityModel.js.map