import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Browser} from "../modules/browser/browser";
import moment = require('moment');

export module LastLogin {
    import removeSid = Storage.removeSid;
    import clickElement = Robot.clickElement;
    import setProxyIP = Browser.setProxyIP;

    let data$ = Storage.getRandomSidData({
            isVerified: true,
            sidID: {$exists: true},
            lastLogin: {$lt: moment().subtract(21, 'd').toDate()}
        }),
        clickedEnglish = false,
        T_TIME = 1000;

    export function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        console.log('Last Login Date before: ', moment().subtract(21, 'd').toDate());
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID email: ', app.userData);
                    app.routineState = 'login';
                    clickedEnglish = false;
                });

                break;
            case 'login':
                setTimeout(() => {
                    app.loginState = 'init';
                    app.loginSubscription = LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        app.routineState = 'init';
                        app.doRestart();
                        if (app.loginSubscription) app.loginSubscription.unsubscribe();
                    });


                }, T_TIME);
                app.routineState = 'inLogin';
                break;
        }
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
                    if (!clickedEnglish) {
                        clickedEnglish = true;
                    }
                }, (T_TIME * 2));
            }
        });

    }


}

