import * as express from "express";
import {SidModel} from "../../models/sidModel";
import {LocationModule} from "../../modules/LocationModule";
import offsetLocation = LocationModule.offsetLocation;

const router = express.Router();

router.get('/:sidId', (req: any, res: any, next: any) => {

    const sidID = req.params.sidId;
    let latLng: any;

    SidModel.findOne({
        sidID: sidID
    }).exec().then((resSid: any) => {

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

            LocationModule.generateLocation(resSid.city, (resData: any) => {

                resSid.latLng = {
                    city: resSid.city,
                    lat: resData[0],
                    lng: resData[1],
                };

                resSid.save().then(function (res: any) {
                    console.log('@Saved SID with City: ', resSid.city, ' ', res.sidID, ' ', resSid.latLng);
                }).catch((err: any) => console.log(err));

                res.status(200).json({
                    lat: resData[0],
                    lng: resData[1],
                });
            });
        }


    }).catch(err => console.log(err));


});

module.exports = router;