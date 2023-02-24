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
let friendsAdded = 0;
let maxFriends = 0;

export module AddPages {
    import clickElement = Robot.clickElement;
    import getDomElementPosition = Browser.getDomElementPosition;
    import sendEvent = ServerAPI.sendEvent;
    import API = ServerAPI.API;
    import updateLastAddFriends = Storage.updateLastAddFriends;
    import removeSid = Storage.removeSid;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
        startShares: {$exists: true},
        haveInitialPhotos: {$type: 9},
        $and: [{
            $or: [{"lastAddFriends": moment().subtract(4, 'd').toDate()},
                {
                    "lastAddFriends": {$exists: false}
                }]
        }]
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
                maxFriends = _.random(20, 40);
                friendsAdded = 0;
                LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                        if (res) {
                            setTimeout(() => {

                                console.log('Current location');
                                console.log();


                                API(app, 'GET', '/fbSids/getFriend').subscribe((data) => {
                                    console.log('fbUser URL: ', data);
                                    if (app.currentLocation.host !== 'm.facebook.com') {
                                        app.routineState = 'init';
                                        app.doRestart();
                                    }
                                    Browser.navigateUrl(io, data.userUrl);
                                    app.routineState = 'addFriend';
                                });
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
            case 'addFriend':
                addFriend(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function addFriend(app, socket, io) {

        console.log('friendsAdded: >>> ', friendsAdded);
        console.log('maxFriends: >>> ', maxFriends);

        if (friendsAdded >= maxFriends) {
            app.doRestart();
            updateLastAddFriends(app.userData._id).subscribe();
        }
        else {
            setTimeout(() => {

                io.emit('getActionBtnPos', {
                    type: 'a',
                    text: 'Add Friend',
                    response: 'clickAddFriendRes',
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'We want to make',
                    type: 'div'
                });

                setTimeout(() => {
                    API(app, 'GET', '/fbSids/getFriend').subscribe((data) => {
                        console.log('fbUser URL: ', data);
                        if (app.currentLocation.host !== 'm.facebook.com') {
                            app.doRestart();
                            app.routineState = 'init';
                        }
                        Browser.navigateUrl(io, data.userUrl);
                    });
                }, (T_TIME * _.random(11, 14)));

            }, 3000);
        }
    }


    function setListeners(app, socket, io) {


        socket.on('clickAddFriendRes', (pos) => {

            if (pos) {
                setTimeout(() => {

                    clickElement(pos, 1, app);
                    sendEvent(app, true).subscribe(() => {
                    });

                    friendsAdded++;

                    setTimeout(() => {
                        io.emit('getActionBtnPos', {
                            type: 'button',
                            text: 'Confirm',
                            response: 'clickElement',
                        });
                    }, 2000);

                }, 2000);


            }
            else {
                console.log('No add friend button');
            }

        });

        socket.on('clickElement', (pos) => {
            if (pos) {
                setTimeout(() => {
                    clickElement(pos, 1, app);
                }, 1000);
            }
        });

        socket.on('checkUnusualActivity', (res) => {

            if (res.exists) {
                console.log('@Unusual Activity error, remove sid: ', res.exists);
                removeSid(app.userData).subscribe(() => {
                });
                app.doRestart();
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }

}

