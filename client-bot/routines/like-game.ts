import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Robot} from "../modules/robot/robot";
import {ServerAPI} from "../API/server-connect";
import * as robot from "robotjs";

let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = 'http://www.multiporgame.info/#l';

export module LikeGame {
    import updateGame = Storage.updateGame;
    let data$;

    export function init(app, socket, io) {

        setListeners(app, socket, io);

        data$ = Storage.getRandomSidData({
            "country": "de",
            "isVerified": true,
            "game": {$exists: false},
        });
    }

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':

                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData._id);
                    console.log('@email:', app.userData.registerEmail);
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
                        }
                        else {
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
        setTimeout(() => {
            console.log('click Confirm');

            io.emit('click', {
                selector: ['button[name="__CONFIRM__"', ''],
                response: 'res',
            });

            setTimeout(() => {

                Browser.navigateUrl(io, '#l');

                setTimeout(() => {

                    console.log('click Image house');
                    io.emit('click', {
                        selector: ['.image130 .pic', ''],
                        response: 'res1',
                    });

                    setTimeout(() => {
                        console.log('click clickLikeRes');
                        io.emit('click', {
                            selector: ['.vote_bg .like_button:visible', '1'],
                            response: 'clickLikeRes',
                        });

                        setTimeout(() => {
                            console.log('restart');
                            app.doRestart();
                        }, (T_TIME * 12));

                    }, (T_TIME * 10));


                }, (T_TIME * 20));

            }, (T_TIME * 20));

        }, (T_TIME * 28));
    }


    function setListeners(app, socket, io) {

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

