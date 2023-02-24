import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {ServerAPI} from "../API/server-connect";

export module Control {
    import clickElement = Robot.clickElement;
    import API = ServerAPI.API;
    let T_TIME = 1000;
    let checkRequestOn = false;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        if (!checkRequestOn) {
            checkRequestOn = true;
            setInterval(() => {
                checkLoginRequest(app, socket, io);
                /*io.emit('resetBrowserStuckTimeout', {});*/
            }, 3000);
        }


        switch (app.routineState) {
            case 'init':
                if (app.userData) {
                    app.routineState = 'login';
                }
                break;
            case 'login':
                app.routineState = 'inLogin';
                setTimeout(() => {
                    app.loginState = 'init';
                    app.loginSubscription = LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        app.routineState = 'idle';
                        if (app.loginSubscription) app.loginSubscription.unsubscribe();
                    });
                }, 2000);

                break;
        }
    }

    function checkLoginRequest(app, socket, io) {
        API(app, 'POST', '/control/getLoginRequest', {containerID: process.env.CONTAINER}).subscribe((loginRequest) => {
            if (loginRequest) {
                Storage.getSidByID(loginRequest.SIDId).subscribe((data) => {
                    if (data) {
                        console.log(data);
                        app.doRestart();
                        API(app, 'POST', '/control/removeLoginRequest', {containerID: process.env.CONTAINER}).subscribe((res) => {
                        });
                        app.userData = data;
                        app.routineState = 'login';
                    }
                    else {
                        console.log('no sid: ', data);
                    }
                });
            }
        });
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function setListeners(app, socket, io) {

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('clickEnglishUS', (pos) => {
            if (pos) {
                pos.precise = true;
                clickElement(pos, 1, app);
                setTimeout(() => {
                    /*if (!clickedEnglish) {
                        clickedEnglish = true;
                    }*/
                }, (T_TIME * 2));
            }
        });

        socket.on('browser_kill', (res) => {
        });

    }


}

