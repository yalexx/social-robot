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
        /*isVerified: true,
         cookie: null,*/
        "provider": "abv.bg", "registerEmail": /.*gmx.*/i
    }), clickedEnglish = false, T_TIME = 1000;
    let counter = 1;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    /*console.log('@SID email: ', app.userData);*/
                    app.userData.registerEmail = app.userData.registerEmail.replace('@gmx.de', '@abv.bg');
                    console.log('@updated SID: ', app.userData);
                    storage_1.Storage.updateSid(app.userData).subscribe((res) => {
                        console.log('@SID UPDATE DONE');
                        counter++;
                        console.log(counter);
                        timers_1.setTimeout(() => {
                            checkState(app, socket, io);
                            app.currentState = 'init';
                        }, 30);
                    });
                });
                /*app.routineState = 'login';
                 clickedEnglish = false;*/
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
