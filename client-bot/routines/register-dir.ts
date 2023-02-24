import {Storage} from "../modules/storage/storage";
import {Browser} from "../modules/browser/browser";
import {userGenerator} from "../modules/userGenerator/userGenerator";
import {Robot} from "../modules/robot/robot";
import {Anticaptcha} from "../modules/anticaptcha/captchaimage";
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import {Utils} from "../modules/utils/unitls";
let registerCount;
export module RegisterDir {
    import generateRandString = Utils.generateRandString;
    let data$ = Storage.getNameData('bulgariannames'),
        userData,
        T_TIME = 300,
        gmail,

        registerUrl = 'http://freemail.dir.bg/new.php';

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
                    app.userData = generateSIDData(data, 'dir.bg');
                    console.log('@app.userData: ', app.userData);
                    subscribe.unsubscribe();
                });
                app.routineState = 'navigateUrl';
                break;
            case 'navigateUrl':
                setTimeout(() => {
                    Browser.navigateUrl(io, registerUrl, true);
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

    export function solveCaptcha(app, socket, io) {

        setTimeout(() => {

            io.emit('get_captcha_img', {
                response: 'captcha_img_data',
                selector: 'body > table:nth-child(2) > tbody > tr > td > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(10) > td:nth-child(2) > img'
            });

        }, (T_TIME * 2));
    }

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

    export function typeCaptcha(app, socket, io) {

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

    function setListeners(app, socket, io) {

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('captcha_img_data', (res) => {

            console.log('captcha_img_data: ');
            console.log(res);

            Anticaptcha.solveImage(res.data).subscribe(
                next => {
                    let captchaText = next.replace(" ", "");
                    app.userData.captcha = captchaText;
                    typeCaptcha(app, socket, io);
                    console.log('onNext: %s', captchaText);
                },
                err => console.log('onError: %s', err),
                () => console.log('onCompleted'));
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
                Storage.storeSID(app.userData);
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

}

