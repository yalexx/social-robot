"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const browser_1 = require("../modules/browser/browser");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
const robot_1 = require("../modules/robot/robot");
const register_input_name_selector_1 = require("../selectors/email/register-input-name.selector");
const register_input_family_name_selector_1 = require("../selectors/email/register-input-family-name.selector");
const captchaimage_1 = require("../modules/anticaptcha/captchaimage");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
const unitls_1 = require("../modules/utils/unitls");
var RegisterGmx;
(function (RegisterGmx) {
    var generateRandString = unitls_1.Utils.generateRandString;
    let data$ = storage_1.Storage.getNameData('germannames'), userData, T_TIME = 1200, gmail, registerUrl = 'http://registrierung.gmx.net';
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var clickElement = robot_1.Robot.clickElement;
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var typeInputData = robot_1.Robot.typeInputData;
    var typeRobotEmail = robot_1.Robot.typeRobotEmail;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    RegisterGmx.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                let subscribe = data$.subscribe((data) => {
                    app.userData = generateSIDData(data, 'gmx.net');
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
                    console.log('@send formExists');
                    checkIP(app, socket, io);
                    selectGender(app, socket, io);
                    io.emit('textExists', {
                        response: 'formExists',
                        text: 'Wunsch-E-Mail-Adresse',
                        type: 'h2'
                    });
                }, (T_TIME * 13));
                app.routineState = 'idle';
                break;
            case 'checkRegStatus':
                setTimeout(() => {
                    io.emit('textExists', {
                        response: 'checkRegStatusRes',
                        text: 'Schön, dass Sie hier sind!',
                        type: 'span'
                    });
                    io.emit('textExists', {
                        response: 'checkRegStatusRes',
                        text: 'Einstellungen',
                        type: 'span'
                    });
                    setTimeout(() => {
                        app.doRestart();
                    }, 7000);
                }, (T_TIME * 6));
                break;
            case 'idle':
                console.log('idle');
                break;
        }
    }
    RegisterGmx.checkState = checkState;
    function solveCaptcha(app, socket, io) {
        setTimeout(() => {
            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                id: 'id9e'
            });
        }, (T_TIME * 2));
    }
    RegisterGmx.solveCaptcha = solveCaptcha;
    // Step 1
    function selectGender(app, socket, io) {
        setTimeout(() => {
            solveCaptcha(app, socket, io);
        }, (T_TIME * 3));
        if (app.userData.gender == 'female') {
            io.emit('getElementPos', {
                response: 'registerInputGenderSelector',
                selector: '#id4'
            });
        }
        else {
            io.emit('getElementPos', {
                response: 'registerInputGenderSelector',
                selector: '#id3'
            });
        }
    }
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
    function typeName(app, socket, io) {
        getDomElementPosition(io, register_input_name_selector_1.registerInputNameSelector);
    }
    RegisterGmx.typeName = typeName;
    function typeFamilyName(app, socket, io) {
        getDomElementPosition(io, register_input_family_name_selector_1.registerInputFamilyNameSelector);
    }
    RegisterGmx.typeFamilyName = typeFamilyName;
    function typeZIP(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputZIPSelector',
            id: 'id6'
        });
    }
    RegisterGmx.typeZIP = typeZIP;
    function typeCity(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputCitySelector',
            id: 'id7'
        });
    }
    RegisterGmx.typeCity = typeCity;
    function typeStreet(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputStreetSelector',
            id: 'id8'
        });
    }
    RegisterGmx.typeStreet = typeStreet;
    function typeStreetNumber(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeStreetNumber',
            id: 'id9'
        });
    }
    RegisterGmx.typeStreetNumber = typeStreetNumber;
    function typeBirthdayDay(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayDaySelector',
            id: 'ida'
        });
    }
    RegisterGmx.typeBirthdayDay = typeBirthdayDay;
    function typeBirthdayMonth(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayMonthSelector',
            id: 'idb'
        });
    }
    RegisterGmx.typeBirthdayMonth = typeBirthdayMonth;
    function typeBirthdayYear(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayYearSelector',
            id: 'idc'
        });
    }
    RegisterGmx.typeBirthdayYear = typeBirthdayYear;
    function typeEmail(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputEmailSelector',
            id: 'id35'
        });
    }
    function typePassword(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typePassword',
            id: 'id1f'
        });
    }
    function typeConfirmPassword(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeConfirmPassword',
            id: 'id20'
        });
    }
    function openEmailContact(app, socket, io) {
        getDomElementPosition(io, {
            response: 'openEmailContact',
            id: 'id3c'
        });
    }
    function typeEmailContact(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeEmailContact',
            id: 'id21'
        });
    }
    RegisterGmx.typeEmailContact = typeEmailContact;
    function typeSecret(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeSecret',
            id: 'id24'
        });
    }
    RegisterGmx.typeSecret = typeSecret;
    function typeCaptcha(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeCaptcha',
            id: 'id25'
        });
    }
    RegisterGmx.typeCaptcha = typeCaptcha;
    function selectRegister(app, socket, io) {
        getDomElementPosition(io, {
            response: 'selectRegister',
            id: 'submitButton'
        });
    }
    RegisterGmx.selectRegister = selectRegister;
    function setListeners(app, socket, io) {
        socket.on('Mayer', (res) => {
            console.log('@res exists new formExists:', res.exists);
            if (res.exists) {
                app.doRestart();
            }
        });
        socket.on('registerInputGenderSelector', (pos) => {
            console.log('@input gender: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                typeName(app, socket, io);
            }
            else {
                console.log('@no inputGender');
                app.doRestart();
            }
        });
        socket.on('registerInputNameSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.name, pos, () => {
                    typeFamilyName(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputFamilyNameSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.familyName, pos, () => {
                    typeZIP(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputZIPSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.zip, pos, () => {
                    typeCity(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputCitySelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.city, pos, () => {
                    typeStreet(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputStreetSelector', (pos) => {
            if (pos) {
                console.log('@street');
                console.log(app.userData);
                typeInputData(io, app.userData.street, pos, () => {
                    typeStreetNumber(app, socket, io);
                }, app);
            }
        });
        socket.on('typeStreetNumber', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.streetNumber, pos, () => {
                    typeBirthdayDay(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputBirthdayMonthSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.month, pos, () => {
                    typeBirthdayYear(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputBirthdayDaySelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.day, pos, () => {
                    typeBirthdayMonth(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputBirthdayYearSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.year, pos, () => {
                    typeEmail(app, socket, io);
                }, app);
            }
        });
        socket.on('registerInputEmailSelector', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerEmail, pos, () => {
                    setTimeout(() => {
                        typePassword(app, socket, io);
                    }, (T_TIME * 2));
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
                        typeEmailContact(app, socket, io);
                    }, (T_TIME * 4));
                }, app);
            }
        });
        /*socket.on('openEmailContact', (position) => {

         clickElement(position, 1, app);

         setTimeout(() => {
         typeEmailContact(app, socket, io);
         }, (T_TIME * 10));

         });*/
        socket.on('typeEmailContact', (pos) => {
            if (pos) {
                gmail = app.userData.registerEmail + generateRandString(1) + '@gmail.com';
                typeRobotEmail(io, gmail, pos, () => {
                    typeSecret(app, socket, io);
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
                app.userData.registerEmail = app.userData.registerEmail + '@gmx.de';
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
        socket.on('checkIP', (res) => {
            if (res.exists) {
                app.doRestart();
            }
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
})(RegisterGmx = exports.RegisterGmx || (exports.RegisterGmx = {}));
