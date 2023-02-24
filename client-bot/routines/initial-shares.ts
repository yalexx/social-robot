import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import * as robot from 'robotjs';
import {Robot} from "../modules/robot/robot";
import {ServerAPI} from "../API/server-connect";
import moment = require('moment');

let _ = require('lodash');

let T_TIME = 1000;
export module InitialShares {
    import clickElement = Robot.clickElement;
    import sendEvent = ServerAPI.sendEvent;
    import updateInitialShares = Storage.updateInitialShares;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
        country: 'bg',
        $and: [{
            $or: [{"initialShares": moment().subtract(5, 'd').toDate()},
                {
                    "initialShares": {$exists: false}
                }]
        }]
    });

    let noLikeBtn = 0;
    let sharePos: number = 0;
    let totalShares = 0;

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
                app.loginSubscription = LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                        if (app.loginSubscription) app.loginSubscription.unsubscribe();
                        if (res) {
                            console.log('@login done');
                            setTimeout(() => {
                                app.routineState = 'clickShare';
                                totalShares = _.random(1, 3);
                                sharePos = 0;

                                setTimeout(() => {
                                    checkState(app, socket, io);
                                }, T_TIME);

                            }, (T_TIME * 3));
                        }
                        else {
                            app.loginState = 'idle';
                            console.log('@no login do restart');
                            app.doRestart();
                        }
                    }, (err) => {
                        console.log('@login error: ', err);
                    });
                app.routineState = 'inLogin';
                break;
            case 'clickShare':
                clickShare(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function clickShare(app, socket, io) {

        Robot.doScroll(1);

        console.log('@Total Shares: ', totalShares);

        setTimeout(() => {

            clickLike(app, socket, io);

            setTimeout(() => {
                io.emit('getElementClass', {
                    response: 'clickShareRes',
                    classText: '._15kr._5a-2',
                    type: 'a',
                    position: sharePos
                });
            }, (T_TIME * 2));


        }, (T_TIME * 4));

    }

    function clickLike(app, socket, io) {

        console.log('@sharePos:', sharePos);
        if (sharePos > 16) {
            app.loginState = 'idle';
            app.doRestart();
            updateInitialShares(app).subscribe();
        }

        io.emit('getElementClass', {
            response: 'clickLike',
            classText: '._15ko._5a-2.touchable',
            type: 'a',
            position: sharePos
        });
    }

    function clickSharePostNow(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickShareNow',
            text: 'Share Post Now',
            type: 'span'
        });
    }

    function clickShareNow(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickShareNow',
            text: 'Share Now',
            type: 'span'
        });
    }


    function setListeners(app, socket, io) {


        socket.on('clickShareRes', (pos) => {
            if (pos) {
                let rand = _.random(1, 2);

                console.log('@click share roll 1/2: ', rand);
                if (rand === 2) {

                    if (pos && pos.top != 0 && pos.left != 0 && pos.width != 0) {
                        clickElement(pos, 1, app);
                    }

                    setTimeout(() => {
                        clickSharePostNow(app, socket, io);
                        setTimeout(() => {
                            clickShareNow(app, socket, io);
                        }, (T_TIME));

                    }, (T_TIME * 4));
                }
            }
            else {
                console.log('No Share Button');
            }
        });

        socket.on('clickLike', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    Robot.doScroll(1);
                }, (T_TIME * 15));
            }
            else {
                console.log('No Like Button');
                noLikeBtn++;
                if (noLikeBtn) {

                }
            }

            sharePos += _.random(1, 2);

            setTimeout(() => {
                /*checkState(app, socket, io);*/
                clickShare(app, socket, io);
            }, (T_TIME * _.random(15, 24)));
        });

        socket.on('clickShareNow', (pos) => {

            console.log('@clickShareNow pos: ', pos);

            if (pos && pos.top != 0 && pos.left != 0 && pos.width != 0) {
                setTimeout(() => {
                    clickElement(pos, 1, app);
                    totalShares--;

                    if (totalShares <= 0) {
                        app.loginState = 'idle';
                        app.doRestart();
                        updateInitialShares(app).subscribe();
                    }

                }, T_TIME);

            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }


}

