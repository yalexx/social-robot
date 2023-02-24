"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cityModel_1 = require("../models/cityModel");
const _ = require("lodash");
var LocationModule;
(function (LocationModule) {
    function generateLocation(city, callback) {
        cityModel_1.CityModel.findOne({
            name: city
        }).exec().then((resCity) => {
            console.log("City From DB: ", resCity.location);
            // Generate location
            let newLocation = randLocation(resCity.location);
            callback(offsetLocation(newLocation));
        }).catch(err => console.log(err));
    }
    LocationModule.generateLocation = generateLocation;
    function randLocation(locationData) {
        return [
            ((parseFloat(locationData[0]) + _.random(-0.010, 0.010)).toFixed(5)),
            ((parseFloat(locationData[1]) + _.random(-0.010, 0.010)).toFixed(5))
        ];
    }
    LocationModule.randLocation = randLocation;
    function offsetLocation(locationData) {
        return [
            ((parseFloat(locationData[0]) + _.random(-0.0001, 0.001)).toFixed(5)),
            ((parseFloat(locationData[1]) + _.random(-0.0001, 0.001)).toFixed(5))
        ];
    }
    LocationModule.offsetLocation = offsetLocation;
})(LocationModule = exports.LocationModule || (exports.LocationModule = {}));
//# sourceMappingURL=LocationModule.js.map