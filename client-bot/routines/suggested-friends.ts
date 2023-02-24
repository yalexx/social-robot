import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import * as robot from 'robotjs';
import {Robot} from "../modules/robot/robot";
import {ServerAPI} from "../API/server-connect";

let _ = require('lodash');

let T_TIME = 1000;
export module SuggestedFriends {
    import clickElement = Robot.clickElement;
    import getDomElementPosition = Browser.getDomElementPosition;
    import sendEvent = ServerAPI.sendEvent;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
        country: 'bg',
        lastAddFriends: {$exists: true},
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
                            console.log('@login done');
                            setTimeout(() => {
                                clickFriendRequests(app, socket, io);
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
            case 'idle':
                console.log('@API Like Page Idle');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function clickFriendRequests(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'clickFriendRequestsRes',
                text: 'Friend Requests',
                type: 'span',
                position: 0
            });

            app.routineState = 'searchFriends';

        }, (T_TIME * 8));

    }

    function clickAddFriend(app, socket, io) {

        console.log('@click add friend');


        io.emit('getActionBtnPos', {
            type: 'div',
            text: 'Confirm',
            response: 'clickAddFriendRes',
        });

        setTimeout(() => {
            app.doRestart();
            io.emit('getActionBtnPos', {
                type: 'div',
                text: 'Add Friend',
                response: 'clickAddFriendRes',
            });
        }, (T_TIME * 15));

    }


    function setListeners(app, socket, io) {

        socket.on('clickFriendRequestsRes', (pos) => {

            if (pos) {
                pos.precise = true;
                pos.top = (pos.top + 20);
                pos.left = (pos.left + 40);

                clickElement(pos, 1, app);

                setTimeout(() => {

                    clickAddFriend(app, socket, io);

                }, (T_TIME * 6));


            }

        });

        socket.on('clickAddFriendRes', (pos) => {

            if (pos && pos.width !== 0 && pos.top !== 0) {
                clickElement(pos, 1, app);

                setTimeout(() => {
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Confirm',
                        response: 'clickAddFriendRes',
                    });

                    sendEvent(app, true).subscribe(() => {
                    });
                }, 2000);


            }
            else {
                console.log('No confirm button');
            }


        });


        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }


}

