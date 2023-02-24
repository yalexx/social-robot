import {Storage} from "../modules/storage/storage";
import {Browser} from "../modules/browser/browser";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";

export module ValidateFacebookDir {

    import getDomElementPosition = Browser.getDomElementPosition;
    import typeRobotEmail = Robot.typeRobotEmail;
    import typeInputData = Robot.typeInputData;
    import clickElement = Robot.clickElement;
    import updateSidData = Storage.updateSidData;
    import removeSid = Storage.removeSid;
    import typeRobotEmailUser = Robot.typeRobotEmailUser;
    let T_TIME: number = 1000;
    let tempPos: any;
    let registerAttempt: number = 0;
    let isValidated;
    const mailLoginUrl = 'http://mail.dir.bg';

    /*TODO Temp*/
    /*let data$ = Storage.getSidByID('5b61fd7a956e8e2b537cb2c4');*/

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':

                /*TODO temp*/
                /*data$.subscribe((data) => {
                    app.userData = data;

                });*/

                isValidated = false;
                app.routineState = 'navigateUrl';

                break;
            case 'navigateUrl':
                setTimeout(() => {
                    Browser.navigateUrl(io, mailLoginUrl);
                    app.routineState = 'closePopup';
                }, 8000);
                app.routineState = 'idle';
                break;
            case 'closePopup':
                setTimeout(() => {
                    typeMailLogin(app, socket, io);
                }, 3000);

                app.routineState = 'idle';
                break;
            case 'typeMailLogin':
                setTimeout(() => {
                    typeMailLogin(app, socket, io);
                }, (T_TIME * 15));
                break;
            case 'clickMailButton':
                app.routineState = 'idle';
                break;
            case 'clickMailLink':
                setTimeout(() => {
                    clickMailLink(app, socket, io);
                }, T_TIME);
                break;
            case 'confirmAccount':
                setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickConfirmAccountRes',
                        selector: '#email_content  table > tbody > tr > td > a > table > tbody > tr > td',
                    });
                }, (T_TIME * 12));

                break;
            case 'ClickContinue':
                setTimeout(() => {

                    typePassword(app, socket, io);

                    getDomElementPosition(io, {
                        response: 'ClickContinue',
                        class: '_2hw0',
                        position: "0",
                        type: 'button',
                        child_position: 0
                    });

                }, (T_TIME * 20));
                app.routineState = 'waitForRestart';
                break;
            case 'waitForRestart':
                console.log('@stay and wait for validation.');
                break;
            case 'idle':
                console.log('Validate facebook is idle.');
                break;

        }
    }

    function typePassword(app, socket, io) {
        console.log('@Init type password.');
        getDomElementPosition(io, {
            response: 'typePassword',
            id: 'm_login_password'
        });
    }

    function typeMailLogin(app, socket, io) {
        setTimeout(() => {
            io.emit('getElementPos', {
                response: 'typeMailLogin',
                selector: '#username',
            });

        }, (T_TIME * 2));
    }

    function typeMailPassword(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeMailPassword',
            selector: '#password',
        });
    }

    function clickMailLogin(app, socket, io) {



        io.emit('getElementPos', {
            response: 'clickMailLogin',
            selector: '#loginForm > div.loginButtons > input[type="submit"]',
        });

    }

    function clickMailLink(app, socket, io) {
        setTimeout(() => {
            console.log('Click Mail Message');

            io.emit('getElementPos', {
                response: 'clickMailLinkRes',
                selector: "a:contains('Facebook')",
            });

            setTimeout(() => {
                io.emit('textExists', {
                    response: 'checkErrorLogin',
                    text: 'грешна парола или име',
                    type: 'div'
                });
            }, 5000);

        }, 12000);
    }

    function checkValidationSuccess(app, socket, io) {

        io.emit('textExists', {
            response: 'checkValidationSuccess',
            text: 'Welcome',
            type: 'span'
        });

        app.routineState = 'waitForRestart';
    }

    function setListeners(app, socket, io) {

        socket.on('clickLogin', (resPos) => {
            if (resPos) {
                clickElement(resPos, 1, app);
                if (app.userData) {
                    updateSidData(app).subscribe((res) => {
                        doRestart(app);
                    });
                }
            }
        });

        socket.on('closePopupRes', (pos) => {
            console.log('@POS: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
            }
        });

        socket.on('browser_kill', (res) => {
            console.log('Stuck for 8 min. Restart Browser.');
            registerAttempt++;
            if (registerAttempt > 3) {
                registerAttempt = 0;
                console.log(registerAttempt, ' Failed validation attempts. Delete Sid.');

                app.currentRoutine = 'registerFacebook';

                removeSid(app.userData).subscribe(() => {
                });
            }
            else {
                console.log(registerAttempt, ' validation attempts. Try again.');
            }
            app.routineState = 'init';
            app.doRestart();
        });

        socket.on('typeMailLogin', (resPos) => {
            if (resPos) {
                typeRobotEmail(io, app.userData.registerEmail, resPos, () => {
                    typeMailPassword(app, socket, io);
                }, app);
            }
        });

        socket.on('typeMailPassword', (resPos) => {
            if (resPos) {
                typeInputData(io, app.userData.registerPassword, resPos, () => {
                    clickMailLogin(app, socket, io);
                }, app);
            }
        });

        socket.on('clickMailLogin', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'clickMailLink';
            }
        });

        socket.on('clickMailLinkRes', (pos) => {

            console.log('clickMailLinkRes');
            console.log(pos);

            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'confirmAccount';
                checkState(app, socket, io);
            }
        });

        socket.on('clickConfirmAccountRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'ClickContinue'
            }
        });

        socket.on('ClickContinue', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    if (!``) {
                        isValidated = true;
                        console.log('@validation done change isValidated');
                        if (app.userData) {
                            updateSidData(app).subscribe((res) => {
                                doRestart(app);
                            });
                        }

                    }

                    io.emit('textExists', {
                        response: 'checkErrorLogin',
                        text: 'Upload A Photo Of Yourself',
                        type: 'div'
                    });

                }, (T_TIME * 14));
            }
            else {
                setTimeout(() => {
                    if (!isValidated) {
                        removeSid(app.userData).subscribe(() => {
                            doRestart(app);
                            console.log('@ClickContinue not found. Removed Sid.');
                        });
                    }
                }, (T_TIME * 28));

            }
        });

        socket.on('checkErrorLogin', (res) => {
            if (res.exists) {
                doRestart(app);
                removeSid(app.userData).subscribe(() => {
                    console.log('@ClickContinue not found. Removed Sid.');
                });
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }

    function doRestart(app) {

        app.currentRoutine = 'registerFacebook';
        app.routineState = 'init';
        app.doRestart();
    }


}

