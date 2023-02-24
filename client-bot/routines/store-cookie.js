"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
var StoreCookie;
(function (StoreCookie) {
    var clickElement = robot_1.Robot.clickElement;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        $or: [{ cookie: null }, { cookie: { $not: { $exists: true } } }]
    });
    let clickedEnglish = false;
    const T_TIME = 1000;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID email: ', app.userData);
                    app.routineState = 'idle';
                    app.routineState = 'login';
                    clickedEnglish = false;
                });
                break;
            case 'login':
                timers_1.setTimeout(() => {
                    app.loginState = 'init';
                    app.loginSubscription = login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        app.routineState = 'init';
                        app.doRestart();
                        if (app.loginSubscription)
                            app.loginSubscription.unsubscribe();
                    });
                }, T_TIME);
                app.routineState = 'inLogin';
                break;
        }
    }
    StoreCookie.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    StoreCookie.init = init;
    function setListeners(app, socket, io) {
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('clickEnglishUS', (pos) => {
            if (pos) {
                pos.precise = true;
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    if (!clickedEnglish) {
                        clickedEnglish = true;
                    }
                }, (T_TIME * 2));
            }
        });
    }
})(StoreCookie = exports.StoreCookie || (exports.StoreCookie = {}));
