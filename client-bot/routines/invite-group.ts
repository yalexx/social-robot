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
let url = 'https://www.facebook.com/groups/1985703248170300/about/';

export module InviteGroup {
    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateCampaigns = Storage.updateCampaigns;
    import getTask = ServerAPI.getTask;
    import sendEvent = ServerAPI.sendEvent;
    import updateGroup = Storage.updateGroup;
    let data$;
    let likes = 0;


    export function init(app, socket, io) {

        setListeners(app, socket, io);
        data$ = Storage.getRandomSidData({
            "lastAddFriends": {$exists: true},
            "group": {$ne: 2},
            "groupInvited": {$ne: 2},
            "isVerified": true,
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

                                navigatePage(app, socket, io);
                                checkState(app, socket, io);
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
            case 'navigatePage':

                navigatePage(app, socket, io);

                break;
            case 'idle':
                console.log('@API Like Page Idle 1');
                break;
        }
    }


    function navigatePage(app, socket, io) {

        Browser.navigateUrl(io, url);

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'clickJoinGroupRes',
                text: '',
                selector: 'button[type="submit"]:visible',
            });

            setTimeout(() => {

                updateGroup(app.userData._id).subscribe();
                app.doRestart();

            }, 8000);


        }, (T_TIME * 13));
    }

    function clickSeeFirst(app, socket, io) {

        getDomElementPosition(io, {
            response: 'clickSeeFirst',
            text: 'See First',
            type: 'span'
        });
    }


    function setListeners(app, socket, io) {

        socket.on('clickJoinGroupRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });

        socket.on('clickSeeFirst', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }

}

