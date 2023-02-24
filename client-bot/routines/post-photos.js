"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const fs = require("fs");
const robot_1 = require("../modules/robot/robot");
const request = require("request");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const unitls_1 = require("../modules/utils/unitls");
const moment = require("moment");
const server_connect_1 = require("../API/server-connect");
let _ = require('lodash');
let Jimp = require("jimp");
var PostPhotos;
(function (PostPhotos) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var rmDir = unitls_1.Utils.rmDir;
    var haveInitialPhotos = storage_1.Storage.haveInitialPhotos;
    var storeimageUrls = storage_1.Storage.storeimageUrls;
    var sendEvent = server_connect_1.ServerAPI.sendEvent;
    let data$ = storage_1.Storage.getRandomSidData({
        'imageUrls.1': { $exists: true },
        haveInitialPhotos: { $lt: moment().subtract(15, 'd').toDate() }
    });
    const T_TIME = 300;
    let photosCount = 0;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                });
                app.routineState = 'login';
                break;
            case 'login':
                app.loginState = 'init';
                login_facebook_1.LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                    if (res) {
                        console.log('@login done');
                        timers_1.setTimeout(() => {
                            timers_1.setTimeout(() => {
                                browser_1.Browser.navigateUrl(io, '/privacy/touch/enablepublic/', true);
                                app.routineState = 'enablePublic';
                                checkState(app, socket, io);
                            }, (T_TIME * 6));
                        }, (T_TIME * 6));
                    }
                    else {
                        console.log('@no login do restart');
                        app.doRestart();
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'enablePublic':
                enablePublic(app, socket, io);
                break;
            case 'allowPublic':
                allowPublic(app, socket, io);
                break;
            case 'postPhotos':
                photosCount = _.random(5, 7);
                downloadImage(app, socket, io);
                break;
        }
    }
    PostPhotos.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    PostPhotos.init = init;
    function enablePublic(app, socket, io) {
        timers_1.setTimeout(() => {
            /*io.emit('getElementPos', {
                response: 'clickEnablePublicRes',
                selector: 'button',
            });*/
            io.emit('getActionBtnPos', {
                type: 'span',
                text: 'Allow Posting',
                response: 'clickEnablePublicRes',
            });
        }, 6000);
        app.routineState = 'idle';
        timers_1.setTimeout(() => {
            browser_1.Browser.navigateUrl(io, '/privacy/touch/composer/selector/', true);
            app.routineState = 'allowPublic';
        }, 14000);
    }
    function allowPublic(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'span',
                text: 'Public',
                response: 'clickAllowPublicRes',
            });
            timers_1.setTimeout(() => {
                app.routineState = 'postPhotos';
                browser_1.Browser.navigateUrl(io, '/home.php');
            }, 8000);
        }, 5000);
    }
    function downloadImage(app, socket, io) {
        console.log('@download image');
        let download = (uri, filename, callback) => {
            request.head(uri, (err, res, body) => {
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };
        let photoUrl = app.userData.imageUrls[0];
        let dir = '../photos/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let imagePath = '../photos/img' + unitls_1.Utils.generateRandString(4) + '.jpg';
        console.log('Random image url: ', photoUrl);
        rmDir('../photos/', false);
        if (app.userData.imageUrls[0].includes("blank.gif")) {
            app.userData.imageUrls.shift();
            storeimageUrls(app.userData).subscribe();
            photosCount--;
            downloadImage(app, socket, io);
        }
        else {
            download(photoUrl, imagePath, () => {
                console.log('Image download Done.');
                Jimp.read(imagePath).then((image) => {
                    image.write(imagePath);
                    timers_1.setTimeout(() => {
                        addPhoto(app, socket, io);
                    }, (T_TIME * 10));
                }).catch((err) => {
                    console.error(err);
                    app.doRestart();
                });
            });
        }
    }
    function addPhoto(app, socket, io) {
        console.log('Add Photo');
        timers_1.setTimeout(() => {
            io.emit('scrollTop');
            timers_1.setTimeout(() => {
                io.emit('getActionBtnPos', {
                    type: 'span',
                    text: 'Photo',
                    response: 'addPhotoRes',
                });
            }, (T_TIME * 5));
        }, (T_TIME * 4));
    }
    function clickPost(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'button',
                text: 'Post',
                response: 'clickPostRes',
            });
        }, (T_TIME * 30));
    }
    function uploadPicture(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 3));
        getDomElementPosition(io, {
            response: 'clickSetPicture',
            class: '_134h',
            position: "0",
            type: 'button',
            child_position: 0
        });
    }
    function setListeners(app, socket, io) {
        socket.on('uploadPhotoRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickEnablePublicRes', (pos) => {
            console.log('clickEnablePublicRes: ', pos);
            clickElement(pos, 1, app);
        });
        socket.on('clickAllowPublicRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
            else {
                app.doRestart();
            }
        });
        socket.on('addPhotoRes', (pos) => {
            console.log('addPhotoRes click btn');
            if (pos) {
                clickElement(pos, 1, app);
                /*clickPublic(app, socket, io);*/
                timers_1.setTimeout(() => {
                    io.emit('getActionBtnPos', {
                        type: 'button',
                        text: 'Photo',
                        response: 'clickAddPictureButtonRes',
                    });
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Add Photo',
                        response: 'clickAddPictureButtonRes',
                    });
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Add photo',
                        response: 'clickAddPictureButtonRes',
                    });
                }, 12000);
            }
            else {
                console.log('No Photo Btn found!');
                app.doRestart();
            }
        });
        socket.on('clickSetPicture', (pos) => {
            clickElement(pos, 1, app);
            timers_1.setTimeout(() => {
                console.log('@upload done send event');
                sendEvent(app, true).subscribe(() => {
                });
            }, 8000);
        });
        socket.on('clickUploadPhoto', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickPostRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.userData.imageUrls.shift();
                storeimageUrls(app.userData).subscribe();
                photosCount--;
                console.log('@imageUrls left: ', app.userData.imageUrls);
                console.log('@photosCount left: ', photosCount);
                timers_1.setTimeout(() => {
                    if (photosCount <= 0) {
                        haveInitialPhotos(app)
                            .subscribe((res) => {
                            app.doRestart();
                        });
                    }
                    else {
                        downloadImage(app, socket, io);
                    }
                }, (T_TIME * 20));
            }
        });
        socket.on('clickAddPictureButtonRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    robot_1.Robot.clickUploadPicture();
                    timers_1.setTimeout(() => {
                        timers_1.setTimeout(() => {
                            io.emit('getActionBtnPos', {
                                type: 'button',
                                text: 'Preview',
                                response: 'clickElement',
                            });
                        }, 8000);
                        clickPost(app, socket, io);
                    }, (T_TIME * 13));
                }, (T_TIME * 6));
            }
            else {
                console.log('No Add picture Btn');
            }
        });
        socket.on('clickElement', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    console.log('CLICK POST !!!');
                    io.emit('getActionBtnPos', {
                        type: 'button',
                        text: 'Post',
                        response: 'clickPostRes',
                    });
                }, 10000);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(PostPhotos = exports.PostPhotos || (exports.PostPhotos = {}));
