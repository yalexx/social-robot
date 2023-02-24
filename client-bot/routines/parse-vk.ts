import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {Robot} from "../modules/robot/robot";

let _ = require('lodash');

let T_TIME = 1000;
let id = 1;
let age = 20;
let maxAge = 40;
let gender = 2; // 1 female 2 male
let maxID = 700;
let country = 9; // germany

let start = false;

export module ParseVK {

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {

            case 'init':

                setTimeout(() => {

                    if (!start) {
                        getVKProfileUrl(app, socket, io);
                        start = true;
                    }

                }, 5000);


                break;

            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function getVKProfileUrl(app, socket, io) {

        /*console.log(`https://vk.com/friends?act=find&c%5Bcountry%5D=${country}&c%%5Bage_from%5D=${age}&c%5Bage_from%5D=${age}&c%5Bage_to%5D=${age}&c%5Bcountry%5D=${country}&c%5Bonline%5D=0&c%5Bper_page%5D=40&c%5Bphoto%5D=1&c%5Bsection%5D=people&c%5Bsex%5D=${gender}`);*/

        if (age > maxAge) {
            console.log('@Maximum age: ', age, ' Stop parse.');
            gender = 1;
            age = 20;

            id = 1;

            let urlVK = `https://vk.com/friends?act=find&c%5Bcountry%5D=${country}&c%%5Bage_from%5D=${age}&c%5Bage_from%5D=${age}&c%5Bage_to%5D=${age}&c%5Bcountry%5D=${country}&c%5Bonline%5D=0&c%5Bper_page%5D=40&c%5Bphoto%5D=1&c%5Bsection%5D=people&c%5Bsex%5D=${gender}`;

            console.log('@urlVK: ', urlVK);

            setTimeout(() => {
                Browser.navigateUrl(io, urlVK, true);

                setTimeout(() => {
                    getVKProfileUrl(app, socket, io);
                }, 5000);

            }, 3000);

        }

        id++;


        if (id > maxID) {

            console.log('@page finish start next age.');
            id = 1;
            age++;


            let urlVK = `https://vk.com/friends?act=find&c%5Bcountry%5D=${country}&c%%5Bage_from%5D=${age}&c%5Bage_from%5D=${age}&c%5Bage_to%5D=${age}&c%5Bcountry%5D=${country}&c%5Bonline%5D=0&c%5Bper_page%5D=40&c%5Bphoto%5D=1&c%5Bsection%5D=people&c%5Bsex%5D=${gender}`;

            console.log('@urlVK: ', urlVK);

            setTimeout(() => {
                Browser.navigateUrl(io, urlVK, true);

                setTimeout(() => {
                    getVKProfileUrl(app, socket, io);
                }, 5000);

            }, 3000);

        }
        else {
            console.log('@GET URL: ', id);

            setTimeout(() => {

                io.emit('getVKProfileUrl', {
                    childId: id,
                    response: 'getVKProfileUrlRes'
                });
            }, 2000);
        }


    }

    function storeVKSid(app, socket, io, url) {


        Storage.getVKSIDData({
            profileUrl: url,
        }).subscribe((data) => {

            console.log('@VK SID DATA: ', data);

            if (data == null) {
                let vkGender;

                if (gender == 1) {
                    vkGender = 'female'
                }
                else {
                    vkGender = 'male'
                }
                Storage.storeVKSID({
                    age: age,
                    gender: vkGender,
                    profileUrl: url
                });
            }
            else {
                console.log('@VKSID alredy exists.');
            }

        });


    }


    function setListeners(app, socket, io) {

        socket.on('getVKProfileUrlRes', (resURL) => {
            console.log('RES: ', resURL);

            storeVKSid(app, socket, io, resURL);

            getVKProfileUrl(app, socket, io);

        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }


}

