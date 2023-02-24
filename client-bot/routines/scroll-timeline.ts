import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import * as robot from 'robotjs';
import {Robot} from "../modules/robot/robot";

let _ = require('lodash');

let T_TIME = 1000;
export module ScrollTimeline {
    import removeSid = Storage.removeSid;
    import doScroll = Robot.doScroll;

    let data$ = Storage.getRandomSidData({
            isVerified: true,
            isUsed: false,

            //TODO temp
            registerEmail: 'marlisalangguth29wg@gmx.de',
            /*haveInitialLikes: {$exists: true}*/
        }),
        scrollLock = false;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
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
                                app.routineState = 'scrollTimeline';
                                checkState(app, socket, io);
                            }, (T_TIME * 3));
                        }
                        else {
                            console.log('@no login do restart');
                            app.doRestart();
                        }
                    }, (err) => {
                        console.log('@login error: ', err);
                    });
                app.routineState = 'inLogin';
                break;
            case 'scrollTimeline':
                scrollLock = false;
                scrollTimeline(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function scrollTimeline(app, socket, io) {
        doScroll(15);
        doRestart(app, socket, io);
    }

    function doRestart(app, socket, io) {

        setTimeout(() => {
            scrollLock = true;
            app.routineState = 'init';
            console.log('Scroll time finish. Restart.');
            app.doRestart();
        }, (T_TIME * _.random(40, 90)));

    }

    function setListeners(app, socket, io) {

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }


}

