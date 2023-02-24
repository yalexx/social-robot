import {Storage} from "../modules/storage/storage";
import {Browser} from "../modules/browser/browser";
import {userGenerator} from "../modules/userGenerator/userGenerator";
import {Robot} from "../modules/robot/robot";
import {registerInputNameSelector} from "../selectors/email/register-input-name.selector";
import {registerInputFamilyNameSelector} from "../selectors/email/register-input-family-name.selector";
import {Anticaptcha} from "../modules/anticaptcha/captchaimage";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import * as robot from 'robotjs';
import {Utils} from "../modules/utils/unitls";
export module RegisterABV {

    import generateRandString = Utils.generateRandString;
    let data$ = Storage.getNameData('bulgariannames'),
        userData,
        T_TIME = 100,
        gmail,
        registerUrl = 'https://passport.abv.bg/app/profiles/registration';

    import generateSIDData = userGenerator.generateSIDData;
    import clickElement = Robot.clickElement;
    import getDomElementPosition = Browser.getDomElementPosition;
    import typeInputData = Robot.typeInputData;
    import typeRobotEmail = Robot.typeRobotEmail;
    import getRandomInt = userGenerator.getRandomInt;
    import generateNumberString = userGenerator.generateNumberString;
    import moveMouse = Robot.moveMouse;

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function checkState(app, socket, io) {

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
                    Browser.navigateUrl(io, registerUrl, true);
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

    /*export function solveCaptcha(app, socket, io) {

        setTimeout(() => {

            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                id: 'preview'
            });

        }, (T_TIME * 2));
    }*/

    export function typeName(app, socket, io) {

        /*solveCaptcha(app, socket, io);*/

        getDomElementPosition(io, {
            response: 'registerInputNameSelector',
            id: 'regformName'
        });
    }

    export function typeFamilyName(app, socket, io) {
        getDomElementPosition(io, {
            response: 'registerInputFamilyNameSelector',
            id: 'regformLastName'
        });
    }

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


    export function typeCaptcha(app, socket, io) {
        getDomElementPosition(io, {
            response: 'typeCaptcha',
            id: 'regformCode'
        });
    }

    export function selectRegister(app, socket, io) {

        io.emit('getElementPos', {
            response: 'selectRegister',
            selector: 'input[name="submit_button"]',
        });

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
                Storage.storeSID(app.userData);
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

            Anticaptcha.solveImage(res.data).subscribe(
                next => {
                    let captchaText = next.replace(" ", "");
                    app.userData.captcha = captchaText;
                    console.log('onNext: %s', captchaText);
                },
                err => console.log('onError: %s', err),
                () => console.log('onCompleted'));
        });

        socket.on('server_msg_element_info_position', (elementPosition) => {
            clickElement(elementPosition, 2, app);
        });
    }

}

