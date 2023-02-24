import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";

let _ = require('lodash');
let request = require('request');

let T_TIME = 1000;
export module SetScool {
    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import removeSid = Storage.removeSid;

    export function init(app, socket, io) {

        checkState(app, socket, io);

        setListeners(app, socket, io);

        function checkState(app, socket, io) {

            console.log('@Current State: ', app.routineState);

            switch (app.routineState) {
                case 'init':
                    Storage.getSidData({
                        facebookID: (app.facebookID.toString()),
                    }).subscribe((data) => {
                        console.log('@USER DATA: ', data);
                        app.userData = data;
                        app.routineState = 'login';
                        checkState(app, socket, io);
                    });
                    app.routineState = 'login';
                    break;
                case 'login':
                    app.loginState = 'init';
                    LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            visitProfile(app, socket, io);
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
                case 'inLogin':
                    console.log('Still not logged in.');
                    break;
                case 'clickAddFriend':
                    clickAddFriend(app, socket, io);
                    break;
                case 'idle':
                    console.log('Idle');
                    break;
            }
        }

        function visitProfile(app, socket, io) {


            setTimeout(() => {

                Browser.navigateUrl(io, app.url);

                setTimeout(() => {
                    app.routineState = 'clickAddFriend';
                    checkState(app, socket, io);
                }, (T_TIME * 4));

            }, (T_TIME * 4));
        }

        function clickAddFriend(app, socket, io) {

            setTimeout(() => {


                getDomElementPosition(io, {
                    response: 'AddFriend',
                    selectClass: 'sx_b4ca13',
                });

            }, (T_TIME * 6));


        }

        function setListeners(app, socket, io) {

            socket.on('AddFriend', (pos) => {
                if (pos) {

                    clickElement(pos, 1, app);

                    app.APIRes.send(JSON.stringify({
                        status: true
                    }));

                    app.addedFriends++;

                    setTimeout(() => {
                        app.routineState = 'idle';
                        app.doRestart();
                    }, (T_TIME * 6));
                }
            });
        }

    }
}

