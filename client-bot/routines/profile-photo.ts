import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import * as fs from "fs";
import {Robot} from "../modules/robot/robot";
import request = require("request");
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Utils} from "../modules/utils/unitls";
import * as robot from 'robotjs';
import {ImageEditor} from "../modules/imageEditor/imageEditor";

let _ = require('lodash');

export module ProfilePhoto {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateSidProfilePhoto = Storage.updateSidProfilePhoto;
    import rmDir = Utils.rmDir;
    import removeVKSid = Storage.removeVKSid;
    import clickUploadPicture = Robot.clickUploadPicture;

    let SIDData = Storage.getRandomData({
        isVerified: true,
        VKSIDID: {$not: {$exists: true}},
    }, 'sids');

    let T_TIME = 1000;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {

            case 'init':

                SIDData.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);

                    let vkSIDData = Storage.getRandomData({
                        gender: app.userData.gender,
                        SIDID: {$not: {$exists: true}},
                    }, 'vkSIDS');

                    vkSIDData.subscribe((VKdata) => {

                        app.VKSIDData = VKdata;
                        console.log('@vkSID: ', VKdata);

                    });
                });
                app.routineState = 'visitVKProfile';
                break;

            case 'visitVKProfile':

                setTimeout(() => {
                    visitProfile(app, socket, io);
                }, (T_TIME * 5));
                app.routineState = 'idle';
                break;

            case 'clickProfileImg':

                console.log('checkProfileUnlockedRes !!!!!');

                setTimeout(() => {

                    io.emit('textExists', {
                        response: 'checkProfileUnlockedRes',
                        text: 'You have to log in',
                        type: 'div'
                    });

                }, 20000);

                app.routineState = 'idle';
                break;

            case 'login':

                app.loginState = 'init';
                setTimeout(() => {
                    LoginFacebook.login$(app, socket, io).subscribe((res) => {
                        if (res) {
                            clickProfileMenu(app, socket, io);
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
                }, (T_TIME * 4));

                break;
            case 'updateDatabase':
                updateDatabase(app, socket, io);
                break;

            case 'idle':
                console.log('Idle from profile-photo');
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

    function visitProfile(app, socket, io) {
        console.log('@VKSIDData.profileUrl:', app.VKSIDData.profileUrl);

        Browser.navigateUrl(io, app.VKSIDData.profileUrl, true);

        app.routineState = 'clickProfileImg';
    }

    function getImageUrl(app, socket, io) {

        console.log('@get image url in 10 sek');

        setTimeout(() => {
            io.emit('getVKProfileImage', {
                response: 'getVKProfileImageRes'
            });
        }, (T_TIME * 10));

    }

    function downloadImage(app, socket, io, imgUrl) {


        console.log('@download image');

        rmDir('../photos/', false);


        ImageEditor.downloadImage(app, imgUrl, () => {

            console.log('Image download Done.');
            Browser.navigateUrl(io, 'https://google.bg');
            setTimeout(() => {
                app.routineState = 'login';
                checkState(app, socket, io);
            }, 3000);
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
        }, (T_TIME * 4));


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
                response: 'enterProfileRes',
                selectClass: '_4ut2',
            });
        }, (T_TIME * 4));
    }

    // Photo

    function clickNewProfileImage(app, socket, io) {

        setTimeout(() => {

            console.log('Click profile photo');


            io.emit('getElementPos', {
                response: 'clickNewProfileImage',
                selector: '._3tlv._3vqq > a > span',
            });

        }, (T_TIME * 12));


    }

    function clickProfileImage(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickProfileImage',
                selectClass: 'profpic',
            });

        }, (T_TIME * 6));


    }

    function changeProfilePick(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'changeProfilePick',
                id: 'nuxChoosePhotoButton'
            });

        }, (T_TIME * 8));


    }

    function uploadPicture(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 2));
    }

    function setAsProfilePicture(app, socket, io) {

        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'setAsProfilePicture',
                id: 'nuxUploadPhotoButton'
            });

        }, (T_TIME * 2));


    }

    function updateDatabase(app, socket, io) {

        setTimeout(() => {

            updateSidProfilePhoto(app).subscribe((res) => {
                app.doRestart();
            });

        }, (T_TIME * 3));
    }

    function setListeners(app, socket, io) {

        socket.on('checkProfileUnlockedRes', (res) => {
            if (!res.exists) {
                setTimeout(() => {


                    io.emit('click', {
                        selector: ['.pp_img:visible'],
                        response: 'clickProfileImgRes',
                    });
                    /*io.emit('getElementClass', {
                        response: 'clickProfileImgRes',
                        classText: '.profile_thumb_img',
                        type: '*'
                    });*/
                }, 2000);
            }
            else {
                app.doRestart();
                removeVKSid(app.VKSIDData, app.userData).subscribe();
                console.log('@do restart');
            }
        });


        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('getVKProfileImageRes', (imgUrl) => {
            setTimeout(() => {
                console.log('getVKProfileImageRes URL: ', imgUrl);

                if (imgUrl) {
                    downloadImage(app, socket, io, imgUrl);
                }
                /*  else {
                      console.log('@Remove VK Profile');
                      removeVKSid(app.VKSIDData, app.userData);
                      app.doRestart();
                  }*/
            }, (T_TIME * 3));
        });

        socket.on('clickProfileImgRes', (exists) => {
            if (exists) {
                getImageUrl(app, socket, io);
            }
            else {
                app.doRestart();
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
                pos.top = pos.top - 60;
                pos.left = pos.left + 40;
                clickElement(pos, 1, app);
                checkState(app, socket, io);
            }
        });

        socket.on('enterProfileRes', (pos) => {
            console.log('@enterProfile pos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);

                clickNewProfileImage(app, socket, io);

            }
            else {
                console.log('@enterProfile pos bug: ', pos);
            }
        });

        socket.on('clickNewProfileImage', (pos) => {

            console.log('@pos: ', pos);

            if (pos) {
                clickElement(pos, 1, app);
                changeProfilePick(app, socket, io);
            }
            else {

                io.emit('getElementPos', {
                    response: 'clickNewProfileNoImageImage',
                    selector: '.ellipsis > a',
                });

                console.log('@No profile image, try click new image');
            }
        });

        socket.on('clickNewProfileNoImageImage', (pos) => {

            console.log('@pos: ', pos);

            if (pos) {
                clickElement(pos, 1, app);
                changeProfilePick(app, socket, io);
            }
            else {
                app.doRestart();
            }
        });

        socket.on('clickPreview', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'clickPost';
            }
        });

        socket.on('clickPublic', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });

        socket.on('setAsProfilePicture', (pos) => {
            console.log('@setAsProfilePos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                app.routineState = 'updateDatabase';
            }
            else {
                app.doRestart();
            }
        });

        socket.on('uploadPicture', (pos) => {

            setTimeout(() => {

                clickUploadPicture();

                setTimeout(() => {
                    setAsProfilePicture(app, socket, io);
                }, (T_TIME * 3));

            }, (T_TIME * 2));

        });

        socket.on('changeProfilePick', (pos) => {
            console.log('@changeProfilePickPos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                uploadPicture(app, socket, io);
            }
            else {
                app.doRestart();
            }
        });
    }
}