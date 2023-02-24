"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const browser_1 = require("../modules/browser/browser");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
const robot_1 = require("../modules/robot/robot");
const captchaimage_1 = require("../modules/anticaptcha/captchaimage");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
const unitls_1 = require("../modules/utils/unitls");
const server_connect_1 = require("../API/server-connect");
var RegisterWebDe;
(function (RegisterWebDe) {
    var generateRandString = unitls_1.Utils.generateRandString;
    let data$ = storage_1.Storage.getNameData('germannames'), userData, T_TIME = 1200, gmail, registerUrl = 'https://registrierung.web.de/User-Registration-Application/';
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var clickElement = robot_1.Robot.clickElement;
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var typeInputData = robot_1.Robot.typeInputData;
    var typeRobotEmail = robot_1.Robot.typeRobotEmail;
    var sendEvent = server_connect_1.ServerAPI.sendEvent;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    RegisterWebDe.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                let subscribe = data$.subscribe((data) => {
                    app.userData = generateSIDData(data, 'web.de');
                    subscribe.unsubscribe();
                });
                app.routineState = 'navigateUrl';
                break;
            case 'navigateUrl':
                setTimeout(() => {
                    browser_1.Browser.navigateUrl(io, registerUrl, true);
                    app.routineState = 'authenticating';
                }, (T_TIME * 8));
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
                }, (T_TIME * 8));
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
    RegisterWebDe.checkState = checkState;
    function solveCaptcha(app, socket, io) {
        console.log('Start solving captcha');
        setTimeout(() => {
            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                selector: '#id7f'
            });
        }, (T_TIME * 2));
    }
    RegisterWebDe.solveCaptcha = solveCaptcha;
    // Step 1
    function selectGender(app, socket, io) {
        if (app.userData.gender == 'female') {
            io.emit('getElementPos', {
                response: 'registerInputGenderSelector',
                selector: '#id2'
            });
        }
        else {
            io.emit('getElementPos', {
                response: 'registerInputGenderSelector',
                selector: '#id1'
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
        io.emit('getElementPos', {
            response: 'registerInputNameSelector',
            selector: '#id4'
        });
    }
    RegisterWebDe.typeName = typeName;
    function typeFamilyName(app, socket, io) {
        io.emit('getElementPos', {
            response: 'registerInputFamilyNameSelector',
            selector: '#id5'
        });
    }
    RegisterWebDe.typeFamilyName = typeFamilyName;
    function typeZIP(app, socket, io) {
        io.emit('getElementPos', {
            response: 'registerInputZIPSelector',
            selector: '#id6'
        });
    }
    RegisterWebDe.typeZIP = typeZIP;
    function typeCity(app, socket, io) {
        io.emit('getElementPos', {
            response: 'registerInputCitySelector',
            selector: '#id7'
        });
    }
    RegisterWebDe.typeCity = typeCity;
    function typeStreet(app, socket, io) {
        io.emit('getElementPos', {
            response: 'registerInputStreetSelector',
            selector: '#id8'
        });
    }
    RegisterWebDe.typeStreet = typeStreet;
    function typeStreetNumber(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeStreetNumber',
            selector: '#id9'
        });
    }
    RegisterWebDe.typeStreetNumber = typeStreetNumber;
    function typeBirthdayDay(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayDaySelector',
            id: 'ida'
        });
    }
    RegisterWebDe.typeBirthdayDay = typeBirthdayDay;
    function typeBirthdayMonth(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayMonthSelector',
            id: 'idb'
        });
    }
    RegisterWebDe.typeBirthdayMonth = typeBirthdayMonth;
    function typeBirthdayYear(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputBirthdayYearSelector',
            id: 'idc'
        });
    }
    RegisterWebDe.typeBirthdayYear = typeBirthdayYear;
    function typeEmail(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputEmailSelector',
            id: 'id1c'
        });
    }
    function typePassword(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typePassword',
            id: 'ide'
        });
    }
    function typeConfirmPassword(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeConfirmPassword',
            id: 'idf'
        });
    }
    function typeEmailContact(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeEmailContact',
            id: 'id10'
        });
    }
    RegisterWebDe.typeEmailContact = typeEmailContact;
    function typeSecret(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeSecret',
            id: 'id13'
        });
    }
    RegisterWebDe.typeSecret = typeSecret;
    function typeCaptcha(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeCaptcha',
            id: 'id14'
        });
    }
    RegisterWebDe.typeCaptcha = typeCaptcha;
    function selectRegister(app, socket, io) {
        getDomElementPosition(io, {
            response: 'selectRegister',
            id: 'submitButton'
        });
    }
    RegisterWebDe.selectRegister = selectRegister;
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
                        solveCaptcha(app, socket, io);
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
                app.userData.registerEmail = app.userData.registerEmail + '@' + app.userData.provider;
                storage_1.Storage.storeSID(app.userData);
                sendEvent(app, true).subscribe(() => {
                });
                console.log('Send register Email Event');
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
            console.log('captcha_img_data:', res);
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
})(RegisterWebDe = exports.RegisterWebDe || (exports.RegisterWebDe = {}));
