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
let _ = require('lodash');
let T_TIME = 1200;
var CoverPhoto;
(function (CoverPhoto) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var updateSidCoverPhoto = storage_1.Storage.updateSidCoverPhoto;
    var rmDir = unitls_1.Utils.rmDir;
    var clickUploadPicture = robot_1.Robot.clickUploadPicture;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        isUsed: false,
        haveCoverPhoto: { $not: { $exists: true } },
    }), T_TIME = 1200, photoUrl = 'https://source.unsplash.com/random/', coverPhotosArray = [
        photoUrl + '1500x700',
        photoUrl + '1800x650',
        photoUrl + '1280x1024',
        photoUrl + '1024x728'
    ];
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    CoverPhoto.init = init;
    function checkState(app, socket, io) {
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
                timers_1.setTimeout(() => {
                    login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
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
                timers_1.setTimeout(() => {
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
    CoverPhoto.checkState = checkState;
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
        download(coverPhotosArray[unitls_1.Utils.randomIntFromInterval(0, (coverPhotosArray.length - 1))], '../photos/image.jpg', () => {
            console.log('Image download Done.');
            app.routineState = 'clickProfileImg';
            clickProfile(app, socket, io);
        });
    }
    function clickPublic(app, socket, io) {
        timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickPost',
                text: 'Post',
                type: 'span',
                position: 1
            });
        }, (T_TIME * 3));
    }
    function clickProfile(app, socket, io) {
        timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
            io.emit('getElementPos', {
                response: 'enterProfileRes',
                selector: '._4ut2:visible',
            });
        }, (T_TIME * 4));
    }
    // Photo
    function clickAddCoverPhoto(app, socket, io) {
        timers_1.setTimeout(() => {
            timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 2));
    }
    function setAsCoverPhoto(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'setAsCoverPhoto',
                text: 'Set as Cover Photo',
                type: 'button',
                position: 0
            });
        }, (T_TIME * 3));
    }
    function updateDatabase(app, socket, io) {
        timers_1.setTimeout(() => {
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
                timers_1.setTimeout(() => {
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
                timers_1.setTimeout(() => {
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
                timers_1.setTimeout(() => {
                    UploadAPhoto(app, socket, io);
                    timers_1.setTimeout(() => {
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
            timers_1.setTimeout(() => {
                clickUploadPicture();
                timers_1.setTimeout(() => {
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
})(CoverPhoto = exports.CoverPhoto || (exports.CoverPhoto = {}));
