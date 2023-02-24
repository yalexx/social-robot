import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import * as fs from "fs";
import {Robot} from "../modules/robot/robot";
import request = require("request");
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";

let _ = require('lodash');
export module PostText {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import removeSid = Storage.removeSid;
    import updateSidProfilePhoto = Storage.updateSidProfilePhoto;
    import typeInputData = Robot.typeInputData;

    let T_TIME = 1200;

    export function checkState(app, socket, io) {

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
                setTimeout(() => {
                    LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            postText(app, socket, io);
                        }
                        else {
                            app.routineState = 'init';
                            app.doRestart();
                        }
                    });
                }, T_TIME);
                app.routineState = 'inLogin';
                break;
            case 'inLogin':
                console.log('Still not logged in.');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }


    function clickPublic(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'clickPublic',
                class: '_1ig0',
                position: "0",
                type: 'div',
                child_position: 0
            });


        }, (T_TIME * 4));
    }


    function postText(app, socket, io) {


        setTimeout(() => {
            io.emit('timelineTextarea', {
                response: 'postText'
            });
        }, (T_TIME * 4));


    }

    function setListeners(app, socket, io) {

        socket.on('postText', (resPos) => {
            if (resPos) {
                typeInputData(io, app.text, resPos, () => {
                    getDomElementPosition(io, {
                        response: 'clickPost',
                        text: 'Post',
                        type: 'button',
                        position: 1
                    });
                }, app);
            }
        });

        socket.on('clickPost', (pos) => {
            if (pos) {

                clickElement(pos, 1, app);

                app.APIRes.send(JSON.stringify({
                    status: true
                }));

                setTimeout(() => {
                    app.routineState = 'idle';
                    app.doRestart();
                }, (T_TIME * 10));
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

    }
}