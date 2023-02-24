"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../modules/storage/storage");
const browser_1 = require("../modules/browser/browser");
const robot_1 = require("../modules/robot/robot");
const robot = require("robotjs");
const timers_1 = require("timers");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
var RegisterFacebook;
(function (RegisterFacebook) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var typeInputData = robot_1.Robot.typeInputData;
    var clickElement = robot_1.Robot.clickElement;
    var typeRobotEmail = robot_1.Robot.typeRobotEmail;
    var removeSid = storage_1.Storage.removeSid;
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    let data$;
    let T_TIME = 1200, clickedEnglish = false, registerUrl = 'https://m.facebook.com/reg/';
    function init(app, socket, io) {
        data$ = storage_1.Storage.getRandomSidData({
            "isVerified": false,
            "provider": "web.de"
        });
        console.log('sidFilter: ', app.containerData.sidFilter);
        setListeners(app, socket, io);
    }
    RegisterFacebook.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((resData) => {
                    if (app.containerData.registerCountry !== 'de') {
                        let subscribe = storage_1.Storage.getNameData('bulgariannames').subscribe((data) => {
                            app.userData = generateSIDData(data, 'abv.bg');
                            console.log('@app.userData: ', app.userData);
                            let tempData = generateSIDData(data, 'abv.bg');
                            tempData.registerEmail = resData.registerEmail;
                            tempData.registerPassword = resData.registerPassword;
                            tempData.provider = resData.provider;
                            tempData._id = resData._id;
                            app.userData = tempData;
                            console.log(app.userData);
                            subscribe.unsubscribe();
                        });
                    }
                    else {
                        app.userData = resData;
                    }
                    app.routineState = 'navigateUrl';
                    checkState(app, socket, io);
                });
                break;
            case 'navigateUrl':
                timers_1.setTimeout(() => {
                    browser_1.Browser.navigateUrl(io, registerUrl);
                    app.routineState = 'doRegistration';
                }, (T_TIME * 10));
                app.routineState = 'idle';
                break;
            case 'doRegistration':
                timers_1.setTimeout(() => {
                    clickedEnglish = false;
                    checkLanguage(app, socket, io);
                    startRegistration(app, socket, io);
                }, (T_TIME * 8));
                app.routineState = 'idle';
                break;
            case 'checkRegStatus':
                timers_1.setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickOkBtnRes',
                        selector: 'button[value="OK"]',
                    });
                }, 5000);
                app.routineState = 'idle';
                break;
            case 'idle':
                console.log('@register facebook idle');
                break;
        }
    }
    RegisterFacebook.checkState = checkState;
    function checkLanguage(app, socket, io) {
        console.log('@check language.');
        timers_1.setTimeout(() => {
            io.emit('elementExists', {
                response: 'checkLanguage',
                text: 'Join Facebook',
                type: 'div'
            });
        }, (T_TIME * 3));
    }
    function clickEnglishUS(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickEnglishUS',
            text: 'English',
            type: 'a',
            position: 0
        });
    }
    function startRegistration(app, socket, io) {
        console.log('@userData:', app.userData);
        checkCurrentFacebookPage(app, socket, io);
    }
    function checkCurrentFacebookPage(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('checkCurrentFacebookPage', {
                response: 'checkCurrentFacebookPageRes'
            });
        }, 2000);
    }
    function typeName(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeName',
            selector: 'input[name="firstname"]',
        });
    }
    function typeFamilyName(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeFamilyName',
            selector: 'input[name="lastname"]',
        });
    }
    function doClickNext(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'button',
                text: 'Next',
                response: 'doClickNext',
            });
        }, (T_TIME * 2));
    }
    function typeEmail(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typeEmailRes',
            selector: 'input[name="reg_email__"]',
        });
    }
    function selectGender(app, socket, io) {
        let selector;
        if (app.userData.gender === 'female') {
            selector = '#Female';
        }
        else {
            selector = '#Male';
        }
        io.emit('getElementPos', {
            response: 'selectGenderByText',
            selector: selector,
        });
    }
    function typePassword(app, socket, io) {
        io.emit('getElementPos', {
            response: 'typePassword',
            selector: 'input[name="reg_passwd__"]',
        });
    }
    function selectBirthdayMonth(app, socket, io) {
        getDomElementPosition(io, {
            response: 'selectBirthdayMonth',
            id: 'month'
        });
    }
    function selectBirthdayDay(app, socket, io) {
        getDomElementPosition(io, {
            response: 'selectBirthdayDay',
            id: 'day'
        });
    }
    function selectBirthdayYear(app, socket, io) {
        getDomElementPosition(io, {
            response: 'selectBirthdayYear',
            id: 'year'
        });
    }
    function clickSignUp(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickSignUp',
            text: 'Sign Up',
            type: 'button',
            position: 0
        });
    }
    function visitWithEmail(app, socket, io) {
        console.log('@visitWithEmail');
        io.emit('getElementPos', {
            response: 'visitWithEmail',
            selector: 'span',
            text: 'Enter Email'
        });
        getDomElementPosition(io, {
            response: 'visitWithEmail',
            text: 'Sign up with email',
            type: 'a',
            position: 0
        });
    }
    function setListeners(app, socket, io) {
        socket.on('checkLanguage', (res) => {
            console.log('@checkLanguage element exists response: #############', res);
            if (res.exists === false) {
                clickEnglishUS(app, socket, io);
            }
        });
        socket.on('typeName', (resPos) => {
            if (resPos) {
                typeInputData(io, app.userData.name, resPos, () => {
                    typeFamilyName(app, socket, io);
                }, app);
            }
        });
        socket.on('checkCurrentFacebookPageRes', (resPos) => {
            console.log('@current fb page:', resPos.currentPage);
            switch (resPos.currentPage) {
                case 'nextPage':
                    doClickNext(app, socket, io);
                    break;
                case 'inputFirstLastName':
                    typeName(app, socket, io);
                    break;
                case 'inputEmail':
                    typeEmail(app, socket, io);
                    break;
                case 'inputBirthday':
                    selectBirthdayMonth(app, socket, io);
                    io.emit('click', {
                        selector: ['[data-sigil="default_birthday_popup_yes"]:visible'],
                        response: '',
                    });
                    break;
                case 'inputGender':
                    selectGender(app, socket, io);
                    break;
                case 'inputPassword':
                    typePassword(app, socket, io);
                    break;
                case 'visitWithEmail':
                    visitWithEmail(app, socket, io);
                    break;
            }
        });
        socket.on('typeFamilyName', (resPos) => {
            if (resPos) {
                typeInputData(io, app.userData.familyName, resPos, () => {
                    doClickNext(app, socket, io);
                }, app);
            }
        });
        socket.on('doClickNext', (resPos) => {
            if (resPos) {
                clickElement(resPos, 1, app);
                checkCurrentFacebookPage(app, socket, io);
            }
        });
        socket.on('selectGender', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                doClickNext(app, socket, io);
            }
        });
        socket.on('selectGenderByText', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                doClickNext(app, socket, io);
            }
        });
        socket.on('typeEmailRes', (pos) => {
            if (pos) {
                typeRobotEmail(io, app.userData.registerEmail, pos, () => {
                    doClickNext(app, socket, io);
                }, app);
            }
        });
        socket.on('typePassword', (pos) => {
            if (pos) {
                typeInputData(io, app.userData.registerPassword, pos, () => {
                    clickSignUp(app, socket, io);
                }, app);
            }
        });
        socket.on('visitWithEmail', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                checkCurrentFacebookPage(app, socket, io);
            }
        });
        socket.on('clickSignUp', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                // Registration Error restart
                timers_1.setTimeout(() => {
                    io.emit('textExists', {
                        response: 'registrationErrorRes',
                        text: 'Registration Error',
                        type: 'span'
                    });
                }, 4000);
                app.routineState = 'checkRegStatus';
                console.log('@clickSignUp!');
            }
        });
        socket.on('clickOkBtnRes', (pos) => {
            console.log('@click OK!');
            if (pos) {
                clickElement(pos, 1, app);
            }
            io.emit('elementExists', {
                response: 'checkRegStatusRes',
                text: 'Captcha',
                type: 'div'
            });
            timers_1.setTimeout(() => {
                app.routineState = 'init';
                app.doRestart();
            }, (T_TIME * 6));
        });
        socket.on('registrationErrorRes', (res) => {
            if (res.exists) {
                app.doRestart();
            }
        });
        socket.on('clickEnglishUS', (pos) => {
            if (pos) {
                pos.precise = true;
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    if (!clickedEnglish) {
                        clickedEnglish = true;
                        console.log('@##### type name');
                        timers_1.setTimeout(() => {
                            typeName(app, socket, io);
                        }, (T_TIME * 3));
                    }
                }, (T_TIME * 2));
            }
        });
        socket.on('selectBirthdayMonth', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    let clickCount = 0;
                    let direction = '';
                    let currFbMonth = new Date().getMonth();
                    if (app.userData.month > currFbMonth) {
                        clickCount = app.userData.month - currFbMonth;
                        direction = 'down';
                        selectMonth(direction, clickCount);
                    }
                    else if (app.userData.month < currFbMonth) {
                        clickCount = currFbMonth - app.userData.month;
                        direction = 'up';
                        selectMonth(direction, clickCount);
                    }
                    function selectMonth(direction, clickCount) {
                        for (let i = 0; i < clickCount; i++) {
                            robot.keyTap(direction);
                        }
                    }
                    timers_1.setTimeout(() => {
                        selectBirthdayDay(app, socket, io);
                    }, T_TIME);
                    pos.precise = true;
                    pos.left = (pos.left - 30);
                    clickElement(pos, 1, app);
                }, T_TIME);
            }
        });
        socket.on('selectBirthdayDay', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    let clickCount = 0;
                    let direction = '';
                    let currDay = new Date().getDate();
                    if (app.userData.day > 28) {
                        app.userData.day = 28;
                    }
                    if (app.userData.day > currDay) {
                        clickCount = app.userData.day - currDay;
                        direction = 'down';
                        selectDay(direction, clickCount);
                    }
                    else if (app.userData.day < currDay) {
                        clickCount = currDay - app.userData.day;
                        direction = 'up';
                        selectDay(direction, clickCount);
                    }
                    function selectDay(direction, clickCount) {
                        for (let i = 0; i < clickCount; i++) {
                            robot.keyTap(direction);
                        }
                    }
                    timers_1.setTimeout(() => {
                        selectBirthdayYear(app, socket, io);
                    }, T_TIME);
                    pos.precise = true;
                    pos.left = (pos.left - 30);
                    clickElement(pos, 1, app);
                }, T_TIME);
            }
        });
        socket.on('selectBirthdayYear', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    let clickCount = 0;
                    let direction = '';
                    if (app.userData.year > 1999) {
                        clickCount = app.userData.year - 1999;
                        direction = 'up';
                        selectYear(direction, clickCount);
                    }
                    else if (app.userData.year < 1999) {
                        clickCount = 1999 - app.userData.year;
                        direction = 'down';
                        selectYear(direction, clickCount);
                    }
                    function selectYear(direction, clickCount) {
                        for (let i = 0; i < clickCount; i++) {
                            robot.keyTap(direction);
                        }
                    }
                    pos.precise = true;
                    pos.left = (pos.left - 30);
                    clickElement(pos, 1, app);
                    timers_1.setTimeout(() => {
                        doClickNext(app, socket, io);
                    }, T_TIME);
                }, T_TIME);
            }
        });
        socket.on('checkRegStatusRes', (res) => {
            console.log('@RES CHECK REG STATUS:', res.exists);
            console.log('@login currentLocation.pathname', app.currentLocation.pathname);
            if (!res.exists && (app.currentLocation.pathname === '/home.php' || app.currentLocation.pathname === '/' || app.currentLocation.pathname === '/login/save-device/')) {
                console.log('@registration done, start validation.');
                app.currentRoutine = 'validateFacebookWebDe';
            }
            else {
                removeSid(app.userData).subscribe(() => {
                    console.log('@ClickContinue not found. Removed Sid.');
                });
            }
            app.doRestart();
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(RegisterFacebook = exports.RegisterFacebook || (exports.RegisterFacebook = {}));
