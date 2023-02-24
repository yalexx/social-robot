import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import * as robot from "robotjs";
import {userGenerator} from "../modules/userGenerator/userGenerator";

let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = '/settings/account/?name';

export module Rename {
    import updateGame = Storage.updateGame;
    import generateSIDData = userGenerator.generateSIDData;
    import updateSidData = Storage.updateSidData;
    let data$;

    export function init(app, socket, io) {

        setListeners(app, socket, io);


        data$ = Storage.getRandomData({"country": "de", "isVerified": true}, 'sids');
    }

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':

                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData);
                });

                app.routineState = 'login';
                break;
            case 'login':
                app.loginState = 'init';
                LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                        if (res) {
                            console.log('@login done');
                            setTimeout(() => {
                                app.routineState = 'idle';
                                navigatePage(app, socket, io);
                            }, (T_TIME * 3));
                        } else {
                            console.log('@no login do restart');
                            app.routineState = 'init';
                            app.doRestart();
                        }
                    }, (err) => {
                        console.log('@login error: ', err);
                    });
                app.routineState = 'inLogin';
                break;
            case 'idle':
                console.log('@API Like Page Idle 1');
                break;
        }
    }


    function navigatePage(app, socket, io) {

        Browser.navigateUrl(io, url);

        let subscribe = Storage.getNameData('bulgariannames').subscribe((data) => {
            let bgUserData = generateSIDData(data, 'abv.bg', app.userData.gender);
            app.userData.name = bgUserData.name;
            app.userData.familyName = bgUserData.familyName;
            app.userData.country = bgUserData.country;
            app.userData.city = bgUserData.city;
            app.userData.street = bgUserData.street;

            console.log('@new bg app.userData: ', app.userData);
            subscribe.unsubscribe();
        });

        setTimeout(() => {

            console.log('Change name: ', app.userData.name);

            io.emit('textExists', {
                response: 'checkAlreadyChangedRes',
                text: "You can't change your name",
                type: 'div'
            });

            io.emit('setValue', {
                selector: ['input[name="primary_first_name"]', 'input[name="primary_first_name"]'],
                val: app.userData.name
            });

            setTimeout(() => {

                console.log('Change familyName: ', app.userData.familyName);

                io.emit('setValue', {
                    selector: ['input[name="primary_last_name"]', 'input[name="primary_last_name"]'],
                    val: app.userData.familyName
                });

                setTimeout(() => {

                    io.emit('click', {
                        selector: ['#m-settings-form > div:nth-child(4) > button', '#m-settings-form > div:nth-child(4) > button'],
                        response: 'res',
                    });

                    setTimeout(() => {

                        console.log('Change familyName: ', app.userData.registerPassword);

                        io.emit('setValue', {
                            selector: ['input[name="save_password"]'],
                            val: app.userData.registerPassword
                        });


                        setTimeout(() => {
                            console.log('click layerConfirm');
                            io.emit('click', {
                                selector: ['#m-settings-form > div:nth-child(6) > button'],
                                response: 'res',
                            });

                            setTimeout(() => {

                                robot.keyTap('f5');
                                setTimeout(() => {

                                    console.log('textExists: ', app.userData.name);
                                    io.emit('textExists', {
                                        response: 'checkNewNameRes',
                                        text: app.userData.name,
                                        type: 'span'
                                    });

                                }, 12000);

                            }, 8000);

                        }, 8000);

                    }, 8000);

                }, 13000);

            }, 6000);


        }, (T_TIME * 15));
    }


    function setListeners(app, socket, io) {

        socket.on('checkNewNameRes', (res) => {
            console.log('checkNewNameRes: ', res);
            if (res.exists) {
                updateSidData(app).subscribe((res) => {
                    console.log('Updated User Data: ');
                });
            } else {
                console.log('Just Restart');
            }
            app.doRestart();
        });


        socket.on('checkAlreadyChangedRes', (res) => {
            console.log('checkAlreadyChangedRes: ', res);
            if (res.exists) {
                updateSidData(app).subscribe((res) => {
                    console.log('Updated User Data: ');
                });
                app.doRestart();
            }
        });


        socket.on('clickLikeRes', (exists) => {
            console.log('exists', exists);
            if (exists) {
                setTimeout(() => {
                    updateGame(app.userData._id).subscribe();
                }, 1000);
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }

}

