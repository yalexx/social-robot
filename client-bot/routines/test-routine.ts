import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import * as robot from 'robotjs';
import {ServerAPI} from "../API/server-connect";

let _ = require('lodash');

export module TestRoutine {

    import clickElement = Robot.clickElement;
    import setLocation = ServerAPI.setLocation;
    let data$ = Storage.getRandomSidData({
            isVerified: true,
            haveProfilePhoto: true,
            isUsed: false,
        }),
        currentState = 'init',
        T_TIME = 700,
        testCount = 0,
        taskUrl = 'http://localhost:3001/';

    export function checkState(app, socket, io) {

        console.log('@Current State: ', currentState);

        switch (currentState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                    currentState = 'navigateUrl';
                });
                break;
            case 'navigateUrl':
                setTimeout(() => {

                    /*setLocation(app, socket, io);*/

                    setTimeout(() => {
                        Browser.navigateUrl(io, 'http://localhost:3001/');
                    }, 5000);

                    /*Browser.navigateUrl(io, taskUrl);*/
                    currentState = 'testEvent';
                }, (T_TIME * 10));
                break;
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'testEvent':
                clickFriendsList(app, socket, io);
                currentState = 'idle';
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function navigatePage(app, socket, io) {

        console.log('@scrollTimeline');
        Browser.navigateUrl(io, taskUrl);
        currentState = 'testEvent';
    }

    function clickFriendsList(app, socket, io) {

        setTimeout(() => {

            io.emit('getInput', {
                response: 'clickInputRes',
                placeholder: 'Enter an employer',
            });


        }, (T_TIME * 10));

    }

    function setListeners(app, socket, io) {

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('clickInputRes', (res) => {

            console.log('@RES: ', res);
            if (res) {
                clickElement(res, 1, app);
                console.log('element found');
            }
            else {
                console.log('element not found');
            }
        });

        /*socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });*/

    }


}

