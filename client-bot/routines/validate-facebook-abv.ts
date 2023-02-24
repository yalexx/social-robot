import {Storage} from "../modules/storage/storage";
import {Browser} from "../modules/browser/browser";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";

export module ValidateFacebookABV {

    import getDomElementPosition = Browser.getDomElementPosition;
    import typeRobotEmail = Robot.typeRobotEmail;
    import typeInputData = Robot.typeInputData;
    import clickElement = Robot.clickElement;
    import updateSidData = Storage.updateSidData;
    import removeSid = Storage.removeSid;
    import typeRobotEmailUser = Robot.typeRobotEmailUser;
    let T_TIME: number = 1000,
        tempPos: any,
        registerAttempt: number = 0,
        isValidated: boolean = false,
        mailLoginUrl = 'https://m.abv.bg/index.html';

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':
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

                    io.emit('hideElement', {
                        selector: '#netinfo-consent-iframe',
                    });

                    /*netinfo-consent-iframe*/
                    setTimeout(() => {
                        console.log('click close popup');
                        io.emit('getElementPos', {
                            response: 'closePopupRes',
                            text: 'Продължи в браузъра',
                            type: 'p',
                        });
                    }, 3000);

                    setTimeout(() => {
                        typeMailLogin(app, socket, io);
                    }, 3000);
                }, 22000);

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

    function clickLogin(app, socket, io) {
        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickLogin',
                id: 'u_0_5'
            });

            setTimeout(() => {
                io.emit('textExists', {
                    response: 'checkErrorLogin',
                    text: 'Грешен потребител',
                    type: 'div'
                });
            }, 3000);
        }, (T_TIME * 2));
    }

    function typeMailLogin(app, socket, io) {
        setTimeout(() => {
            io.emit('getElementPos', {
                response: 'typeMailLogin',
                selector: 'input[name="username"]',
            });

        }, (T_TIME * 2));
    }

    function typeMailPassword(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeMailPassword',
            selector: 'input[name="password"]',
        });
    }

    function clickMailLogin(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickMailLogin',
            selector: 'input[name="submit_button"]',
        });

    }

    function clickMailLink(app, socket, io) {
        setTimeout(() => {
            io.emit('getElementPos', {
                response: 'clickMailLinkRes',
                selector: '.abv-inboxSubject',
            });
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

    function checkErrorLogin(app, socket, io) {

        console.log('@checkErrorLogin');

        io.emit('textExists', {
            response: 'checkErrorLogin',
            text: 'Login leider nicht erfolgreich',
            type: 'h2'
        });
    }

    function setListeners(app, socket, io) {

        socket.on('typePassword', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerPassword, pos, () => {
                    clickLogin(app, socket, io);
                }, app);
            }
        });

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
                typeRobotEmailUser(io, app.userData.registerEmail, resPos, () => {
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

