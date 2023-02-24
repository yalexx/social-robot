import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import * as fs from "fs";
import {Robot} from "../modules/robot/robot";
import request = require("request");
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Utils} from "../modules/utils/unitls";
import moment = require('moment');
import {ImageEditor} from '../modules/imageEditor/imageEditor';
import {ServerAPI} from "../API/server-connect";

let _ = require('lodash');
let Jimp = require("jimp");

export module PostPhotos {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import rmDir = Utils.rmDir;
    import haveInitialPhotos = Storage.haveInitialPhotos;
    import storeimageUrls = Storage.storeimageUrls;
    import sendEvent = ServerAPI.sendEvent;

    let data$ = Storage.getRandomSidData({
        'imageUrls.1': {$exists: true},
        haveInitialPhotos: {$lt: moment().subtract(15, 'd').toDate()}
    });

    const T_TIME = 300;

    let photosCount: number = 0;

    export function checkState(app, socket, io) {

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
                LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {

                        if (res) {
                            console.log('@login done');
                            setTimeout(() => {

                                setTimeout(() => {
                                    Browser.navigateUrl(io, '/privacy/touch/enablepublic/', true);
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

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function enablePublic(app, socket, io) {

        setTimeout(() => {

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

        setTimeout(() => {
            Browser.navigateUrl(io, '/privacy/touch/composer/selector/', true);
            app.routineState = 'allowPublic';
        }, 14000);
    }

    function allowPublic(app, socket, io) {

        setTimeout(() => {

            io.emit('getActionBtnPos', {
                type: 'span',
                text: 'Public',
                response: 'clickAllowPublicRes',
            });

            setTimeout(() => {
                app.routineState = 'postPhotos';
                Browser.navigateUrl(io, '/home.php');
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
        let imagePath = '../photos/img' + Utils.generateRandString(4) + '.jpg';
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
                    setTimeout(() => {
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
        setTimeout(() => {

            io.emit('scrollTop');

            setTimeout(() => {

                io.emit('getActionBtnPos', {
                    type: 'span',
                    text: 'Photo',
                    response: 'addPhotoRes',
                });


            }, (T_TIME * 5));


        }, (T_TIME * 4));

    }

    function clickPost(app, socket, io) {

        setTimeout(() => {
            io.emit('getActionBtnPos', {
                type: 'button',
                text: 'Post',
                response: 'clickPostRes',
            });

        }, (T_TIME * 30));
    }

    function uploadPicture(app, socket, io) {

        setTimeout(() => {
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

                setTimeout(() => {
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
            setTimeout(() => {
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

                setTimeout(() => {

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

                setTimeout(() => {

                    Robot.clickUploadPicture();

                    setTimeout(() => {


                        setTimeout(() => {

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

                setTimeout(() => {

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


}

