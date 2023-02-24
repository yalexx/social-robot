import request = require("request");

let _ = require('lodash');
let Jimp = require("jimp");
import * as fs from "fs";
import {Utils} from "../utils/unitls";
import rmDir = Utils.rmDir;
import {setTimeout} from "timers";

export module ImageEditor {


    export function downloadImage(app, url, callback): void {

        rmDir('../photos/', false);

        let name = Utils.generateRandString(8) + '.jpg';
        let filename = '../photos/' + name;

        request.head(url, function (err, res, body) {

            if (err) {
                app.doRestart();
                console.log('@error downloading image: ', err);
            }
            else {
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);

                request(url).pipe(fs.createWriteStream(filename)).on('close', editImage);

            }

            function editImage() {

                console.log('@Start editing the image');

                Jimp.read(filename).then((image) => {

                    image.quality(80)
                        .scale(1.3)
                        .flip(true, false)
                        .brightness(0.1)
                        .contrast(0.1)
                        .dither565()
                        .blur(1)
                        .normalize()
                        .write(filename);

                    callback();


                }).catch((err) => {
                    console.log('@Error editing the image');
                });

            }


        });

    }


}