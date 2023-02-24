import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";

export module StoreCookie {
    import removeSid = Storage.removeSid;
    import clickElement = Robot.clickElement;

    let data$ = Storage.getRandomSidData({
            /*isVerified: true,
             cookie: null,*/
            "provider": "abv.bg", "registerEmail": /.*gmx.*/i
        }),
        clickedEnglish = false,
        T_TIME = 1000;
    let counter = 1;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':

                data$.subscribe((data) => {

                    app.userData = data;

                    /*console.log('@SID email: ', app.userData);*/

                    app.userData.registerEmail = app.userData.registerEmail.replace('@gmx.de', '@abv.bg');

                    console.log('@updated SID: ', app.userData);

                    Storage.updateSid(app.userData).subscribe((res) => {

                        console.log('@SID UPDATE DONE');
                        counter++;
                        console.log(counter);

                        setTimeout(() => {
                            checkState(app, socket, io);
                            app.currentState = 'init';
                        }, 30);

                    });


                });
                /*app.routineState = 'login';
                 clickedEnglish = false;*/
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

