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
let registerCount;
var RegisterDir;
(function (RegisterDir) {
    var generateRandString = unitls_1.Utils.generateRandString;
    let data$ = storage_1.Storage.getNameData('bulgariannames'), userData, T_TIME = 300, gmail, registerUrl = 'http://freemail.dir.bg/new.php';
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var clickElement = robot_1.Robot.clickElement;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    RegisterDir.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                let subscribe = data$.subscribe((data) => {
                    app.userData = generateSIDData(data, 'dir.bg');
                    console.log('@app.userData: ', app.userData);
                    subscribe.unsubscribe();
                });
                app.routineState = 'navigateUrl';
                break;
            case 'navigateUrl':
                setTimeout(() => {
                    browser_1.Browser.navigateUrl(io, registerUrl, true);
                    app.routineState = 'authenticating';
                }, (T_TIME * 15));
                break;
            case 'authenticating':
                setTimeout(() => {
                    typeEmail(app, socket, io);
                }, (T_TIME * 8));
                app.routineState = 'idle';
                break;
            case 'checkRegStatus':
                setTimeout(() => {
                    io.emit('textExists', {
                        response: 'checkRegStatusRes',
                        text: 'Успешно регистрирахте пощенска кутия',
                        type: 'span'
                    });
                    app.doRestart();
                }, (T_TIME * 5));
                break;
            case 'idle':
                console.log('idle');
                break;
        }
    }
    RegisterDir.checkState = checkState;
    function solveCaptcha(app, socket, io) {
        setTimeout(() => {
            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                selector: 'body > table:nth-child(2) > tbody > tr > td > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(10) > td:nth-child(2) > img'
            });
        }, (T_TIME * 2));
    }
    RegisterDir.solveCaptcha = solveCaptcha;
    function typeEmail(app, socket, io) {
        solveCaptcha(app, socket, io);
        io.emit('setValue', {
            selector: 'input[name="login"]',
            val: app.userData.registerEmail
        });
        io.emit('setValue', {
            selector: 'input[name="password"]',
            val: app.userData.registerPassword
        });
        io.emit('setValue', {
            selector: 'input[name="password"]',
            val: app.userData.registerPassword
        });
        io.emit('setValue', {
            selector: 'input[name="cpassword"]',
            val: app.userData.registerPassword
        });
        io.emit('setValue', {
            selector: 'input[name="email"]',
            val: app.userData.registerEmail + generateRandString(1) + '@gmail.com'
        });
    }
    function typeCaptcha(app, socket, io) {
        console.log('typeCaptcha');
        io.emit('setValue', {
            selector: 'input[name="private_key"]',
            val: app.userData.captcha
        });
        io.emit('getElementPos', {
            response: 'checkboxRes',
            selector: '#agreement_check'
        });
    }
    RegisterDir.typeCaptcha = typeCaptcha;
    function setListeners(app, socket, io) {
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('captcha_img_data', (res) => {
            console.log('captcha_img_data: ');
            console.log(res);
            captchaimage_1.Anticaptcha.solveImage(res.data).subscribe(next => {
                let captchaText = next.replace(" ", "");
                app.userData.captcha = captchaText;
                typeCaptcha(app, socket, io);
                console.log('onNext: %s', captchaText);
            }, err => console.log('onError: %s', err), () => console.log('onCompleted'));
        });
        socket.on('checkboxRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    console.log('Click Register');
                    io.emit('click', {
                        selector: '#submit_button'
                    });
                    app.routineState = 'checkRegStatus';
                }, 4000);
            }
        });
        socket.on('checkRegStatusRes', (res) => {
            console.log('@res exists:', res.exists);
            if (res.exists) {
                app.userData.registerEmail = app.userData.registerEmail + '@' + app.userData.provider;
                storage_1.Storage.storeSID(app.userData);
                registerCount++;
                console.log('########## Register Count: ', registerCount + ' ##########');
                app.registeredEmails++;
            }
            else {
                console.log('Element not found.');
            }
        });
        socket.on('server_msg_element_info_position', (elementPosition) => {
            clickElement(elementPosition, 2, app);
        });
    }
})(RegisterDir = exports.RegisterDir || (exports.RegisterDir = {}));
