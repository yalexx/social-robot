"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const browser_1 = require("../modules/browser/browser");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
var ValidateFacebookABV;
(function (ValidateFacebookABV) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var typeInputData = robot_1.Robot.typeInputData;
    var clickElement = robot_1.Robot.clickElement;
    var updateSidData = storage_1.Storage.updateSidData;
    var removeSid = storage_1.Storage.removeSid;
    var typeRobotEmailUser = robot_1.Robot.typeRobotEmailUser;
    let T_TIME = 1000, tempPos, registerAttempt = 0, isValidated = false, mailLoginUrl = 'https://m.abv.bg/index.html';
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    ValidateFacebookABV.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                isValidated = false;
                app.routineState = 'navigateUrl';
                break;
            case 'navigateUrl':
                timers_1.setTimeout(() => {
                    browser_1.Browser.navigateUrl(io, mailLoginUrl);
                    app.routineState = 'closePopup';
                }, 8000);
                app.routineState = 'idle';
                break;
            case 'closePopup':
                timers_1.setTimeout(() => {
                    io.emit('hideElement', {
                        selector: '#netinfo-consent-iframe',
                    });
                    /*netinfo-consent-iframe*/
                    timers_1.setTimeout(() => {
                        console.log('click close popup');
                        io.emit('getElementPos', {
                            response: 'closePopupRes',
                            text: 'Продължи в браузъра',
                            type: 'p',
                        });
                    }, 3000);
                    timers_1.setTimeout(() => {
                        typeMailLogin(app, socket, io);
                    }, 3000);
                }, 22000);
                app.routineState = 'idle';
                break;
            case 'typeMailLogin':
                timers_1.setTimeout(() => {
                    typeMailLogin(app, socket, io);
                }, (T_TIME * 15));
                break;
            case 'clickMailButton':
                app.routineState = 'idle';
                break;
            case 'clickMailLink':
                timers_1.setTimeout(() => {
                    clickMailLink(app, socket, io);
                }, T_TIME);
                break;
            case 'confirmAccount':
                timers_1.setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickConfirmAccountRes',
                        selector: '#email_content  table > tbody > tr > td > a > table > tbody > tr > td',
                    });
                }, (T_TIME * 12));
                break;
            case 'ClickContinue':
                timers_1.setTimeout(() => {
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
    ValidateFacebookABV.checkState = checkState;
    function typePassword(app, socket, io) {
        console.log('@Init type password.');
        getDomElementPosition(io, {
            response: 'typePassword',
            id: 'm_login_password'
        });
    }
    function clickLogin(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickLogin',
                id: 'u_0_5'
            });
            timers_1.setTimeout(() => {
                io.emit('textExists', {
                    response: 'checkErrorLogin',
                    text: 'Грешен потребител',
                    type: 'div'
                });
            }, 3000);
        }, (T_TIME * 2));
    }
    function typeMailLogin(app, socket, io) {
        timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
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
                app.routineState = 'ClickContinue';
            }
        });
        socket.on('ClickContinue', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
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
                timers_1.setTimeout(() => {
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
})(ValidateFacebookABV = exports.ValidateFacebookABV || (exports.ValidateFacebookABV = {}));
