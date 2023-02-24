"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const server_connect_1 = require("../API/server-connect");
var Control;
(function (Control) {
    var clickElement = robot_1.Robot.clickElement;
    var API = server_connect_1.ServerAPI.API;
    let T_TIME = 1000;
    let checkRequestOn = false;
    function checkState(app, socket, io) {
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
                timers_1.setTimeout(() => {
                    app.loginState = 'init';
                    app.loginSubscription = login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        app.routineState = 'idle';
                        if (app.loginSubscription)
                            app.loginSubscription.unsubscribe();
                    });
                }, 2000);
                break;
        }
    }
    Control.checkState = checkState;
    function checkLoginRequest(app, socket, io) {
        API(app, 'POST', '/control/getLoginRequest', { containerID: process.env.CONTAINER }).subscribe((loginRequest) => {
            if (loginRequest) {
                storage_1.Storage.getSidByID(loginRequest.SIDId).subscribe((data) => {
                    if (data) {
                        console.log(data);
                        app.doRestart();
                        API(app, 'POST', '/control/removeLoginRequest', { containerID: process.env.CONTAINER }).subscribe((res) => {
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
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    Control.init = init;
    function setListeners(app, socket, io) {
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('clickEnglishUS', (pos) => {
            if (pos) {
                pos.precise = true;
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    /*if (!clickedEnglish) {
                        clickedEnglish = true;
                    }*/
                }, (T_TIME * 2));
            }
        });
        socket.on('browser_kill', (res) => {
        });
    }
})(Control = exports.Control || (exports.Control = {}));
