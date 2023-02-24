"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const browser_1 = require("../modules/browser/browser");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
const robot_1 = require("../modules/robot/robot");
const captchaimage_1 = require("../modules/anticaptcha/captchaimage");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
var RegisterABV;
(function (RegisterABV) {
    let data$ = storage_1.Storage.getNameData('bulgariannames'), userData, T_TIME = 100, gmail, registerUrl = 'https://passport.abv.bg/app/profiles/registration';
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var clickElement = robot_1.Robot.clickElement;
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var typeInputData = robot_1.Robot.typeInputData;
    var generateNumberString = userGenerator_1.userGenerator.generateNumberString;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    RegisterABV.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                let subscribe = data$.subscribe((data) => {
                    app.userData = generateSIDData(data, 'abv.bg');
                    console.log('@app.userData: ', app.userData);
                    subscribe.unsubscribe();
                });
                app.routineState = 'navigateUrl';
                break;
            case 'navigateUrl':
                setTimeout(() => {
                    browser_1.Browser.navigateUrl(io, registerUrl, true);
                    app.routineState = 'authenticating';
                }, (T_TIME * 12));
                break;
            case 'authenticating':
                setTimeout(() => {
                    typeName(app, socket, io);
                }, (T_TIME * 8));
                app.routineState = 'idle';
                break;
            case 'checkRegStatus':
                setTimeout(() => {
                    io.emit('textExists', {
                        response: 'checkRegStatusRes',
                        text: 'Регистрацията в АБВ завърши успешно!',
                        type: 'p'
                    });
                    io.emit('textExists', {
                        response: 'checkRegStatusRes',
                        text: 'Einstellungen',
                        type: 'span'
                    });
                    setTimeout(() => {
                        app.doRestart();
                    }, 3000);
                }, (T_TIME * 5));
                break;
            case 'idle':
                console.log('idle');
                break;
        }
    }
    RegisterABV.checkState = checkState;
    /*export function solveCaptcha(app, socket, io) {

        setTimeout(() => {

            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                id: 'preview'
            });

        }, (T_TIME * 2));
    }*/
    function typeName(app, socket, io) {
        /*solveCaptcha(app, socket, io);*/
        getDomElementPosition(io, {
            response: 'registerInputNameSelector',
            id: 'regformName'
        });
    }
    RegisterABV.typeName = typeName;
    function typeFamilyName(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputFamilyNameSelector',
            id: 'regformLastName'
        });
    }
    RegisterABV.typeFamilyName = typeFamilyName;
    function typeEmail(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputEmailSelector',
            id: 'regformUsername'
        });
    }
    function typePassword(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typePassword',
            selector: 'input[name="password"]',
        });
    }
    function typeConfirmPassword(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeConfirmPassword',
            selector: 'input[name="password2"]',
        });
    }
    function typePhone(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typePhone',
            selector: 'input[name="mobilePhone"]',
        });
    }
    function setGender(app, socket, io) {
        console.log('@setGender');
        let inputValue;
        if (app.userData.gender === 'female') {
            inputValue = 1;
        }
        else {
            inputValue = 2;
        }
        io.emit('setValue', {
            selector: 'input[name="gender"]',
            val: inputValue
        });
        setTimeout(() => {
            // set day
            io.emit('setValue', {
                selector: 'input[name="bday"]',
                val: app.userData.day
            });
            // set month
            io.emit('setValue', {
                selector: 'input[name="bmonth"]',
                val: app.userData.month
            });
            // set year
            io.emit('setValue', {
                selector: 'input[name="byear"]',
                val: app.userData.year
            });
            setTimeout(() => {
                typeCaptcha(app, socket, io);
            }, 1000);
            selectRegister(app, socket, io);
        }, 2000);
    }
    function typeCaptcha(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeCaptcha',
            id: 'regformCode'
        });
    }
    RegisterABV.typeCaptcha = typeCaptcha;
    function selectRegister(app, socket, io) {
        io.emit('getElementPos', {
            response: 'selectRegister',
            selector: 'input[name="submit_button"]',
        });
    }
    RegisterABV.selectRegister = selectRegister;
    function checkIP(app, socket, io) {
        setTimeout(() => {
            console.log('@Check text exists ip');
            io.emit('textExists', {
                response: 'checkIP',
                text: 'Registrierung leider nicht möglich!',
                type: 'h2'
            });
        }, (T_TIME * 3));
    }
    function setListeners(app, socket, io) {
        socket.on('registerInputNameSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.name.trim(), pos, () => {
                    typeFamilyName(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputFamilyNameSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.familyName.trim(), pos, () => {
                    typeEmail(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputEmailSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerEmail, pos, () => {
                    typePassword(app, socket, io);
                }, app);
            }
        });
        socket.on('typePassword', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerPassword, pos, () => {
                    setTimeout(() => {
                        typeConfirmPassword(app, socket, io);
                    }, T_TIME);
                }, app);
            }
        });
        socket.on('typeConfirmPassword', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerPassword, pos, () => {
                    setTimeout(() => {
                        typePhone(app, socket, io);
                    }, (T_TIME * 2));
                }, app);
            }
        });
        socket.on('typePhone', (pos) => {
            if (pos) {
                let phoneNumber = generateNumberString(7);
                typeInputData(io, 89 + phoneNumber, pos, () => {
                    setTimeout(() => {
                        setGender(app, socket, io);
                    }, T_TIME);
                }, app);
            }
        });
        socket.on('typeSecret', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.secretQuestion, pos, () => {
                    typeCaptcha(app, socket, io);
                }, app);
            }
        });
        socket.on('typeCaptcha', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.captcha, pos, () => {
                    setTimeout(() => {
                        selectRegister(app, socket, io);
                    }, (T_TIME * 4));
                }, app);
            }
        });
        socket.on('selectRegister', (res) => {
            clickElement(res, 1, app);
            app.routineState = 'checkRegStatus';
        });
        socket.on('checkRegStatusRes', (res) => {
            console.log('@res exists:', res.exists);
            if (res.exists) {
                app.userData.registerEmail = app.userData.registerEmail + '@' + app.userData.provider;
                storage_1.Storage.storeSID(app.userData);
                app.registeredEmails++;
            }
            else {
                console.log('Element not found.');
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('captcha_img_data', (res) => {
            captchaimage_1.Anticaptcha.solveImage(res.data).subscribe(next => {
                let captchaText = next.replace(" ", "");
                app.userData.captcha = captchaText;
                console.log('onNext: %s', captchaText);
            }, err => console.log('onError: %s', err), () => console.log('onCompleted'));
        });
        socket.on('server_msg_element_info_position', (elementPosition) => {
            clickElement(elementPosition, 2, app);
        });
    }
})(RegisterABV = exports.RegisterABV || (exports.RegisterABV = {}));
