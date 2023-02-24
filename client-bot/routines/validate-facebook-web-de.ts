import {Storage} from "../modules/storage/storage";
import {Browser} from "../modules/browser/browser";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {ServerAPI} from "../API/server-connect";

export module ValidateFacebookWebDe {

    import getDomElementPosition = Browser.getDomElementPosition;
    import typeRobotEmail = Robot.typeRobotEmail;
    import typeInputData = Robot.typeInputData;
    import clickElement = Robot.clickElement;
    import updateSidData = Storage.updateSidData;
    import removeSid = Storage.removeSid;
    import sendEvent = ServerAPI.sendEvent;
    let T_TIME: number = 1000,
        tempPos: any,
        registerAttempt: number = 0,
        isValidated: boolean = false,
        mailLoginUrl = 'https://web.de';

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
                }, 8000);
                app.routineState = 'clickEmailTab';
                break;
            case 'clickEmailTab':
                clickEmailTab(app, socket, io);
                break;
            case 'clickMailButton':
                setTimeout(() => {
                    io.emit('hideElement', {
                        selector: '#interstitialClose',
                    });
                    setTimeout(() => {
                        clickMailButton(app, socket, io);
                    }, (T_TIME * 10));

                    setTimeout(() => {
                        checkErrorLogin(app, socket, io);
                    }, (T_TIME * 5));

                }, (T_TIME * 10));
                app.routineState = 'idle';
                break;
            case 'clickMailLink':
                setTimeout(() => {
                    clickMailLink(app, socket, io);
                }, T_TIME);
                break;
            case 'confirmAccount':
                setTimeout(() => {
                    let newTempPos = tempPos;
                    newTempPos.top = 300;
                    newTempPos.left = -330;

                    setTimeout(() => {
                        clickElement(tempPos, 1, app);
                        app.routineState = 'ClickContinue'
                    }, (T_TIME * 4));
                }, (T_TIME * 10));

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

    function clickEmailTab(app, socket, io) {

        setTimeout(() => {
            io.emit('hideElement', {
                selector: '.cookie-lasche__content',
            });
            setTimeout(() => {
                getDomElementPosition(io, {
                    response: 'clickEmailTabRes',
                    text: 'FreeMail',
                    type: 'span'
                });
            }, 2000);
        }, 3000);
    }

    function checkCurrentFacebookPage(app, socket, io) {
        io.emit('checkCurrentFacebookPage', {response: 'checkCurrentFacebookPageRes'});
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
        }, (T_TIME * 2));

    }

    function typeMailLogin(app, socket, io) {

        console.log('@Tape mail email');
        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'typeMailLogin',
                class: 'login-username',
                position: 0,
                type: 'input',
                child_position: 0
            });
        }, (T_TIME * 2));


    }

    function typeMailPassword(app, socket, io) {

        getDomElementPosition(io, {
            response: 'typeMailPassword',
            class: 'login-password',
            position: "0",
            type: 'input',
            child_position: 0
        });

    }

    function clickMailLogin(app, socket, io) {

        getDomElementPosition(io, {
            response: 'clickMailLogin',
            class: 'login-submit',
            position: "0",
            type: 'input',
            child_position: 0
        });

    }


    function clickMailButton(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickMailButton',
            selector: '.sidebar__folder-list-item',
        });
    }

    function clickMailLink(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickMailLink',
            text: 'Facebook confirmation code',
            type: 'dd'
        });
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
                pos.top = (pos.top - 20);
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

        socket.on('typeMailLogin', (pos) => {
            if (pos) {
                pos.top = (pos.top - 20);
                typeRobotEmail(io, app.userData.registerEmail, pos, () => {
                    typeMailPassword(app, socket, io);
                }, app);
            }
        });

        socket.on('typeMailPassword', (pos) => {
            if (pos) {
                pos.top = (pos.top - 20);
                typeInputData(io, app.userData.registerPassword, pos, () => {
                    clickMailLogin(app, socket, io);
                }, app);
            }
        });

        socket.on('clickMailLogin', (resPos) => {
            if (resPos) {
                if (app.gmxZoom) resPos.left = resPos.left + 40;
                clickElement(resPos, 1, app);
                app.routineState = 'clickMailButton';
            }
        });

        socket.on('clickMailButton', (pos) => {
            if (pos) {
                pos.precise = true;
                clickElement(pos, 1, app);
                app.routineState = 'clickMailLink';
            }
        });

        socket.on('clickEmailTabRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    typeMailLogin(app, socket, io);
                }, 2000);
            }
        });

        socket.on('clickMailLink', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                tempPos = pos;
                app.routineState = 'confirmAccount';
                checkState(app, socket, io);
            }
        });

        socket.on('ClickContinue', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    if (!isValidated) {
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
                    io.emit('textExists', {
                        response: 'checkErrorLogin',
                        text: 'Help Us',
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
        setTimeout(() => {
            app.currentRoutine = 'registerFacebook';
            app.routineState = 'init';
            app.doRestart();
        }, 10000);
    }


}

