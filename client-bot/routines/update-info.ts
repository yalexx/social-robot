import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";

let request = require('request');
let _ = require('lodash');

export module UpdateInfo {
    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import typeInputData = Robot.typeInputData;
    import updateInfo = Storage.updateInfo;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
        country: 'bg',
        startShares: {$exists: true},
        updateInfo: {$not: {$exists: true}},
    });
    let T_TIME = 1000;
    let company = '';
    let university = '';

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {

            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                });

                Storage.getData('bulgariancompanies').subscribe((data) => {

                    company = data['name'][_.random(0, (data['name'].length - 1))];
                    console.log('@Company: ', company);
                });

                Storage.getData('bulgarianuniversities').subscribe((data) => {

                    university = data['universities'][_.random(0, (data['universities'].length - 1))];
                    console.log('@University: ', university);
                });

                app.routineState = 'login';
                break;

            case 'login':
                app.loginState = 'init';
                setTimeout(() => {
                    LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            clickProfileMenu(app, socket, io);
                        }
                        else {
                            app.doRestart();
                        }
                    });
                }, T_TIME);
                app.routineState = 'inLogin';
                break;

            case 'inLogin':
                console.log('Still not logged in.');
                break;

            case 'enterProfile':
                setTimeout(() => {
                    enterProfile(app, socket, io);
                }, (T_TIME * 3));
                break;


        }
    }


    function checkCurrentFacebookPage(app, socket, io) {

        setTimeout(() => {
            io.emit('textExists', {
                response: 'textExists',
                text: 'Professional Skills',
                type: 'div'
            });

            io.emit('getElementPos', {
                response: 'clickSave',
                text: 'Try Again',
                type: 'a',
            });

            setTimeout(() => {
                io.emit('checkCurrentFacebookPage', {
                    response: 'checkCurrentFacebookPageRes'
                });
            }, 4000);

        }, (T_TIME * 3));
    }

    function clickProfileMenu(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'clickProfileMenu',
                text: 'Main Menu',
                type: 'span',
                position: 0
            });
            app.routineState = 'enterProfile';
        }, (T_TIME * 4));
    }

    function enterProfile(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'enterProfile',
                selectClass: '_4ut2',
            });
            app.routineState = 'enterInfo';
        }, (T_TIME * 4));
    }

    function clickUpdateInfo(app, socket, io) {

        console.log('@click update info');

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'clickUpdateInfoRes',
                text: 'Update Info',
                type: 'span',
            });

        }, (T_TIME * 6));

    }

    function inputHomeCity(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'inputHomeCity',
                selector: 'input[placeholder="Enter a city"]',
            });

        }, (T_TIME * 3));

    }

    function inputUniversity(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'inputUniversity',
                selector: 'input[placeholder="Enter a college"]',
            });

            io.emit('getElementPos', {
                response: 'inputUniversity',
                selector: 'input[placeholder="Enter a university"]',
            });

        }, (T_TIME * 3));
    }


    function inputWork(app, socket, io) {

        setTimeout(() => {
            io.emit('getElementPos', {
                response: 'inputWork',
                selector: 'input[placeholder="Enter an employer"]',
            });
        }, (T_TIME * 3));
    }

    function inputCurrentCity(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'inputCurrentCity',
                selector: 'input[placeholder="Enter current city"]',
            });
        }, (T_TIME * 4));
    }

    function skipPage(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'skipPage',
                text: 'Skip',
                type: 'span',
            });

        }, (T_TIME * 3));

    }

    function selectOption(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementClass', {
                response: 'selectOption',
                classText: '.jx-result',
                type: 'div',
                position: 0
            });

        }, (T_TIME * 2));

    }

    function clickSave(app, socket, io) {

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'clickSave',
                text: 'Save',
                type: 'span',
            });

            io.emit('getElementPos', {
                response: 'clickSave',
                text: 'Next',
                type: 'a',
            });

        }, (T_TIME * 4));

    }

    function updateDatabase(app, socket, io) {

        setTimeout(() => {

            console.log('@ UPDATE DATABASE, restart browser.');

            updateInfo(app.userData._id).subscribe((res) => {
                setTimeout(() => {
                    app.routineState = 'init';
                }, 13000);
                app.doRestart();
            });

        }, (T_TIME * 3));
    }

    function setListeners(app, socket, io) {

        socket.on('checkCurrentFacebookPageRes', (resPos) => {
            console.log('@Current fb page:', resPos.currentPage);

            switch (resPos.currentPage) {

                case 'inputHomeCity':
                    inputHomeCity(app, socket, io);
                    break;

                case 'inputUniversity':
                    inputUniversity(app, socket, io);
                    break;

                case 'inputWork':
                    inputWork(app, socket, io);
                    break;

                case 'inputCurrentCity':
                    inputCurrentCity(app, socket, io);
                    break;

                case 'skipPage':
                    skipPage(app, socket, io);
                    break;

                case 'nextPage':
                    io.emit('getElementPos', {
                        response: 'clickSave',
                        text: 'Next',
                        type: 'a',
                    });
                    setTimeout(() => {
                        checkCurrentFacebookPage(app, socket, io);
                    }, 9000);
                    break;


            }
        });

        socket.on('reviewingRes', (res) => {
            if (res.exists) {
                io.emit('getElementPos', {
                    response: 'clickSave',
                    text: 'Next',
                    type: 'a',
                });
                setTimeout(() => {
                    checkCurrentFacebookPage(app, socket, io);
                }, 9000);

            }

        });

        socket.on('textExists', (res) => {

            console.log('@checkUrlContainFriendsRes: ', res);
            if (res.exists) {
                updateDatabase(app, socket, io);
            }
        });

        socket.on('selectOption', (pos) => {

            if (pos) {

                io.emit('scrollTop');

                setTimeout(() => {

                    clickElement(pos, 1, app);
                    setTimeout(() => {
                        checkCurrentFacebookPage(app, socket, io);
                    }, 9000);
                }, T_TIME);
            }

            setTimeout(() => {

                clickSave(app, socket, io);

            }, (T_TIME * 2));
        });

        socket.on('inputHomeCity', (pos) => {
            if (pos) {

                setTimeout(() => {
                    io.emit('scrollTop');
                    typeInputData(io, app.userData.city, pos, () => {
                        selectOption(app, socket, io);
                    }, app);

                }, (T_TIME * 2));
            }
        });

        socket.on('inputUniversity', (pos) => {

            if (pos) {

                setTimeout(() => {

                    io.emit('scrollTop');
                    typeInputData(io, university, pos, () => {

                        selectOption(app, socket, io);

                    }, app);


                }, (T_TIME * 3));


            }
        });

        socket.on('inputWork', (pos) => {

            if (pos) {

                setTimeout(() => {
                    io.emit('scrollTop');
                    typeInputData(io, company, pos, () => {

                        selectOption(app, socket, io);

                    }, app);

                }, (T_TIME * 2));


            }

        });

        socket.on('inputCurrentCity', (pos) => {

            console.log('inputCurrentCity pos: ', pos);
            if (pos) {

                setTimeout(() => {
                    io.emit('scrollTop');
                    let cityArray = [
                        'Sofia',
                        'Plovdiv',
                        'Varna',
                        'Burgas',
                        'Stara Zagora',
                        'Ruse'
                    ];
                    typeInputData(io, cityArray[_.random(0, (cityArray.length - 1))], pos, () => {
                        selectOption(app, socket, io);
                    }, app);

                }, (T_TIME * 2));
            }

        });

        socket.on('skipPage', (pos) => {

            if (pos) {

                setTimeout(() => {
                    clickElement(pos, 1, app);
                    io.emit('scrollTop');

                    setTimeout(() => {
                        checkCurrentFacebookPage(app, socket, io);
                    }, 5000);

                }, (T_TIME * 3));


            }

        });

        socket.on('clickUpdateInfoRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    checkCurrentFacebookPage(app, socket, io);
                }, 5000);

            }
        });


        socket.on('clickSave', (pos) => {
            if (pos && pos.top !== 0) {
                setTimeout(() => {
                    clickElement(pos, 1, app);
                }, (T_TIME * 4));

            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('clickProfileMenu', (pos) => {
            if (pos) {
                pos.precise = true;
                pos.top = pos.top + 20;
                pos.left = pos.left + 40;
                clickElement(pos, 1, app);
                checkState(app, socket, io);
            }
        });

        socket.on('enterProfile', (pos) => {

            if (pos) {
                clickElement(pos, 1, app);
                clickUpdateInfo(app, socket, io);
            }
            else {
                console.log('@enterProfile pos bug: ', pos);
            }
        });
    }
}