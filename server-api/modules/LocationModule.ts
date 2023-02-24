import {CityModel} from "../models/cityModel";
import * as _ from "lodash";

export module LocationModule {

    export function generateLocation(city: String, callback: any): void {

        CityModel.findOne({
            name: city
        }).exec().then((resCity: any) => {

            console.log("City From DB: ", resCity.location);

            // Generate location
            let newLocation = randLocation(resCity.location);

            callback(offsetLocation(newLocation));

        }).catch(err => console.log(err));

    }

    export function randLocation(locationData: any) {
        return [
            ((parseFloat(locationData[0]) + _.random(-0.010, 0.010)).toFixed(5)),
            ((parseFloat(locationData[1]) + _.random(-0.010, 0.010)).toFixed(5))
        ];
    }

    export function offsetLocation(locationData: any) {
        return [
            ((parseFloat(locationData[0]) + _.random(-0.0001, 0.001)).toFixed(5)),
            ((parseFloat(locationData[1]) + _.random(-0.0001, 0.001)).toFixed(5))
        ];
    }

}

