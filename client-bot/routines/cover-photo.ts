import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import * as fs from "fs";
import {Robot} from "../modules/robot/robot";
import request = require("request");
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Utils} from "../modules/utils/unitls";
import * as robot from 'robotjs';

let _ = require('lodash');

let T_TIME = 1200;
export module CoverPhoto {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateSidCoverPhoto = Storage.updateSidCoverPhoto;
    import rmDir = Utils.rmDir;
    import clickUploadPicture = Robot.clickUploadPicture;

    let data$ = Storage.getRandomSidData({
            isVerified: true,
            isUsed: false,
            haveCoverPhoto: {$not: {$exists: true}},
        }),
        T_TIME = 1200,
        photoUrl = 'https://source.unsplash.com/random/',
        coverPhotosArray = [
            photoUrl + '1500x700',
            photoUrl + '1800x650',
            photoUrl + '1280x1024',
            photoUrl + '1024x728'
        ];


    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    export function checkState(app, socket, io) {

        console.log('@RoutineState State: ', app.routineState);

        switch (app.routineState) {
            case 'init':

                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                });
                app.routineState = 'login';

                /*robot.moveMouse(360, 120);*/

                break;
            case 'login':
                app.loginState = 'init';
                setTimeout(() => {
                    LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            app.routineState = 'enterProfile';
                            downloadImage(app, socket, io);
                        }
                        else {
                            app.routineState = 'init';
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
            case 'clickProfileImg':
                clickProfile(app, socket, io);
                break;
            case 'updateDatabase':
                updateDatabase(app, socket, io);
                break;
            case 'idle':
                console.log('cover photo idle');
                break;
        }
    }


    function downloadImage(app, socket, io) {
        console.log('@download image');

        rmDir('../photos/', false);

        let download = (uri, filename, callback) => {
            request.head(uri, function (err, res, body) {
                console.log('content-type:', res.headers['content-type']);
                console.log('content-length:', res.headers['content-length']);
                request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
        };

        download(coverPhotosArray[Utils.randomIntFromInterval(0,
            (coverPhotosArray.length - 1))], '../photos/image.jpg', () => {
            console.log('Image download Done.');
            app.routineState = 'clickProfileImg';
            clickProfile(app, socket, io);
        });

    }

    function clickPublic(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'clickPublic',
                class: '_1ig0',
                position: "0",
                type: 'div',
                child_position: 0
            });


        }, (T_TIME * 4));
    }

    function clickPreview(app, socket, io) {

        getDomElementPosition(io, {
            response: 'clickPreview',
            text: 'Preview',
            type: 'span',
            position: 1
        });


    }

    function clickPost(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickPost',
                text: 'Post',
                type: 'span',
                position: 1
            });
        }, (T_TIME * 3));


    }


    function clickProfile(app, socket, io) {

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
            io.emit('getElementPos', {
                response: 'enterProfileRes',
                selector: '._4ut2:visible',
            });
        }, (T_TIME * 4));
    }

    // Photo

    function clickAddCoverPhoto(app, socket, io) {


        setTimeout(() => {

            setTimeout(() => {

                /*io.emit('elementExists', {
                    response: 'checkCoverExistsRes',
                    text: 'Edit',
                    type: '#m-timeline-cover-section span:visible'
                });*/

                io.emit('getElementPos', {
                    response: 'clickAddCoverPhoto',
                    text: 'Add Photo',
                    type: 'span',
                    selector: ':visible'
                });

            }, (T_TIME * 10));


        }, (T_TIME * 6));


    }


    function UploadAPhoto(app, socket, io) {

        io.emit('getElementPos', {
            response: 'UploadAPhotoRes',
            text: 'Upload a photo',
            type: 'h1',
            position: 0
        });

    }

    function AddPicture(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'AddPictureRes',
                text: 'Add Picture',
                type: 'button',
                position: 0
            });

        }, (T_TIME * 3));


    }

    function uploadPicture(socket, io) {
        console.log('@uploadPicture');
        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 2));


    }

    function setAsCoverPhoto(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'setAsCoverPhoto',
                text: 'Set as Cover Photo',
                type: 'button',
                position: 0
            });

        }, (T_TIME * 3));


    }

    function updateDatabase(app, socket, io) {

        setTimeout(() => {
            updateSidCoverPhoto(app).subscribe((res) => {
                //app.currentRoutine = 'profilePhoto';
                app.doRestart();
            });

        }, (T_TIME * 3));
    }

    function setListeners(app, socket, io) {

        socket.on('clickPublic', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    //addPhoto(socket, io, userData);
                }, (T_TIME * 2));

            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('clickPreview', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'clickPost';
            }
        });

        socket.on('clickPost', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    app.doRestart();
                }, (T_TIME * 8));
            }
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

        socket.on('checkCoverExistsRes', (exists) => {
            console.log('checkCoverExistsRes: ', exists);
            if (exists) {
                updateDatabase(app, socket, io);
            }
        });


        socket.on('clickAddCoverPhoto', (pos) => {

            if (pos) {
                clickElement(pos, 1, app);
                setTimeout(() => {
                    UploadAPhoto(app, socket, io);
                    setTimeout(() => {
                        AddPicture(app, socket, io);
                    }, (T_TIME * 6));
                }, (T_TIME * 2));
            }
            else {
                app.doRestart();
            }
        });

        socket.on('UploadAPhotoRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });

        socket.on('AddPictureRes', (pos) => {
            if (pos) {

                console.log('@AddPicture');
                clickElement(pos, 1, app);
                uploadPicture(socket, io);
            }
        });

        socket.on('uploadPicture', (pos) => {

            setTimeout(() => {


                clickUploadPicture();

                setTimeout(() => {
                    setAsCoverPhoto(app, socket, io);
                }, (T_TIME * 2));

            }, (T_TIME * 2));


        });

        socket.on('enterProfileRes', (pos) => {
            console.log('@enterProfile pos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                clickAddCoverPhoto(app, socket, io);
            }
            else {
                console.log('@enterProfile pos bugg: ', pos);
                app.doRestart();
            }
        });

        socket.on('setAsCoverPhoto', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'updateDatabase';
            }
        });

    }


}

