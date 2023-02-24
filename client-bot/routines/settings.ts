import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Robot} from "../modules/robot/robot";
let _ = require('lodash');
let T_TIME = 1000;

export module Settings {
    import clickElement = Robot.clickElement;
    import settings = Storage.settings;
    let data$ = Storage.getRandomSidData({
        "settings": {$exists: false},
        "isVerified": true,
        "country": 'bg'
    });

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
                            setTimeout(() => {
                                app.routineState = 'seeFriendsRes';
                                Browser.navigateUrl(io, '/privacy/touch/basic/');
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
            case 'seeFriendsRes':
                setTimeout(() => {
                    seeFriendsRes(app, socket, io);
                }, 2000);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function seeFriendsRes(app, socket, io) {

        io.emit('getElementPos', {
            type: 'h3',
            text: 'Who can see your friends',
            response: 'seeFriendsRes',
        });

    }


    function setListeners(app, socket, io) {

        socket.on('clickFriendsElement', (pos) => {
            if (pos) {
                setTimeout(() => {
                    clickElement(pos, 1, app);
                    settings(app.userData._id).subscribe();
                }, 1000);
            }
        });

        socket.on('seeFriendsRes', (pos) => {
            if (pos) {
                setTimeout(() => {
                    clickElement(pos, 1, app);

                    setTimeout(() => {
                        io.emit('getElementPos', {
                            type: 'div',
                            text: 'Your friends on Facebook',
                            response: 'clickFriendsElement',
                        });
                        
                        setTimeout(() => {
                            app.doRestart();
                        }, 6000);

                    }, 8000);

                }, 1000);
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }

}

