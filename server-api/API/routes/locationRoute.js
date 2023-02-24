"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const sidModel_1 = require("../../models/sidModel");
const LocationModule_1 = require("../../modules/LocationModule");
var offsetLocation = LocationModule_1.LocationModule.offsetLocation;
const router = express.Router();
router.get('/:sidId', (req, res, next) => {
    const sidID = req.params.sidId;
    let latLng;
    sidModel_1.SidModel.findOne({
        sidID: sidID
    }).exec().then((resSid) => {
        console.log("From DB: ", resSid.latLng);
        // Get SID location from DB
        if (resSid.latLng) {
            latLng = offsetLocation([resSid.latLng.lat, resSid.latLng.lng]);
            // Send location data
            res.status(200).json(latLng);
        }
        // Generate location
        else {
            console.log('No location');
            LocationModule_1.LocationModule.generateLocation(resSid.city, (resData) => {
                resSid.latLng = {
                    city: resSid.city,
                    lat: resData[0],
                    lng: resData[1],
                };
                resSid.save().then(function (res) {
                    console.log('@Saved SID with City: ', resSid.city, ' ', res.sidID, ' ', resSid.latLng);
                }).catch((err) => console.log(err));
                res.status(200).json({
                    lat: resData[0],
                    lng: resData[1],
                });
            });
        }
    }).catch(err => console.log(err));
});
module.exports = router;
//# sourceMappingURL=locationRoute.js.map