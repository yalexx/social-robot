import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import moment = require('moment');

let _ = require('lodash');

let likesRange = [8, 20];

export module InitialLikes {
    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateInitialLikes = Storage.updateInitialLikes;

    let data$ = Storage.getRandomSidData({
            isVerified: true,
        }),
        T_TIME = 1000,
        pagesArray;


    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', app.userData);
                    Storage.getInitialPages({}, app.userData.country + '_pages').subscribe((data) => {
                        console.log('@initialLikes Data: ',);
                        pagesArray = _.shuffle(data['topPages']);
                        pagesArray = _.slice(pagesArray, 0, _.random(likesRange[0], likesRange[1]));

                        console.log('@spiced pagesArray: ', pagesArray);
                        console.log('@pagesArray length: ', pagesArray.length);
                    });
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
                                app.routineState = 'navigatePage';
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
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'likePage':
                likePage(app, socket, io);
                app.routineState = 'idle';
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function navigatePage(app, socket, io) {
        if (pagesArray[0] !== undefined) {
            Browser.navigateUrl(io, pagesArray[0], true);
            app.routineState = 'likePage';
        }
        else {
            app.doRestart();
        }

    }

    export function likePage(app, socket, io) {

        setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Like',
                response: 'likePageRes',
            });

        }, (T_TIME * _.random(4, 6)));

        pagesArray = _.slice(pagesArray, 1, pagesArray.length);
        setTimeout(() => {
            app.routineState = 'navigatePage';
            checkState(app, socket, io);
        }, 13000);

    }

    function setListeners(app, socket, io) {

        socket.on('likePageRes', (pos) => {

            if (pos) {

                if (pagesArray.length > 1) {

                    clickElement(pos, 1, app);
                    console.log('remove : ', pagesArray[0]);
                    console.log('@pagesArray: ', pagesArray);
                    console.log('@pagesArray length: ', pagesArray.length);

                }
                else {
                    updateInitialLikes(app).subscribe((res) => {
                        console.log('@Update initial likes');
                        app.doRestart();
                    });
                }
            }
            else {
                app.doRestart();
            }

        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }


}

