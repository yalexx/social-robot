import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Browser} from "../modules/browser/browser";

export module Addmefast {
    import wremoveSid = Storage.removeSid;
    import clickElement = Robot.clickElement;
    import setProxyIP = Browser.setProxyIP;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
    });


    let clickedEnglish = false;
    const T_TIME = 1000;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID email: ', app.userData);

                    app.routineState = 'idle';
                    /*setProxyIP(app).subscribe((res) => {
                        if (res) {
                            app.routineState = 'login';
                            clickedEnglish = false;
                            checkState(app, socket, io);
                        }
                        else {
                            app.doRestart();
                        }


                    });*/
                    app.routineState = 'login';
                    clickedEnglish = false;
                });

                break;
            case 'login':
                setTimeout(() => {
                    app.loginState = 'init';
                    app.loginSubscription = LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        app.routineState = 'init';

                        Browser.navigateUrl(io, 'http://addmefast.com');

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

