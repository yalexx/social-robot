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
import {ServerAPI} from '../API/server-connect';

let _ = require('lodash');

export module GetPhotos {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateSidProfilePhoto = Storage.updateSidProfilePhoto;
    import rmDir = Utils.rmDir;
    import removeVKSid = Storage.removeVKSid;
    import clickUploadPicture = Robot.clickUploadPicture;
    import getVKSidByID = Storage.getVKSidByID;
    import storeimageUrls = Storage.storeimageUrls;
    import checkImageText = ServerAPI.checkImageText;

    let SIDData = Storage.getRandomData({
        "imageUrls": {$not: {$exists: true}},
        "VKSIDID": {$exists: true},
    }, 'sids');

    /*TODO temp*/
    /*let SIDData = Storage.getSidByID('5ad571cdcb32752cdb2f0c82');*/

    let T_TIME = 1000;
    let imageArray = [];
    let imageUrls = [];

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {

            case 'init':

                SIDData.subscribe((data) => {
                    app.userData = data;
                    app.userData.imageUrls = [];
                    imageUrls = [];
                    let vkSIDData;
                    console.log('@SID: ', data);
                    if (app.userData.VKSIDID) {
                        console.log('VK SID exists');
                        vkSIDData = getVKSidByID(app.userData.VKSIDID)
                    }
                    else {
                        console.log('Nev VK SID');
                        vkSIDData = Storage.getRandomData({
                            gender: app.userData.gender,
                            SIDID: {$not: {$exists: true}},
                        }, 'vkSIDS');
                    }
                    imageArray = [];

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
                        text: 'You have to log in in order to view this page.',
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
            case 'getProfileImg':

                if (imageArray[0]) {
                    Browser.navigateUrl(io, imageArray[0], true);
                }
                setTimeout(() => {
                    io.emit('getVKImage', {
                        response: 'getVKImageRes'
                    });
                }, (T_TIME * 5));
                app.routineState = 'idle';
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

    function getImageUrls(app, socket, io) {

        setTimeout(() => {
            io.emit('getVKAllImages', {
                response: 'getVKAllImagesRes'
            });
        }, (T_TIME * 10));

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

                    console.log('clickPhotos text');
                    io.emit('getElementPos', {
                        response: 'clickPhotosRes',
                        text: 'Photos',
                        type: 'span',
                    });

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

        socket.on('getVKAllImagesRes', (imgUrls) => {

            if (imgUrls.length > 150) imgUrls = imgUrls.slice(0, 150);
            console.log('imgUrls length: ', imgUrls.length);
            imageArray = imgUrls;

            if (imageArray.length > 0) {
                console.log(imageArray);

                imageArray.shift();
                app.routineState = 'getProfileImg';
                checkState(app, socket, io);
            }
        });

        socket.on('clickPhotosRes', (pos) => {

            console.log('@clickPhotosRes: ', pos);

            if (pos) {
                clickElement(pos, 1, app);

                setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickAllPhotosRes',
                        selector: '.album_thumb:first'
                    });


                }, 5000);

            }
            else {
                removeVKSid(app.VKSIDData).subscribe();
                app.doRestart();
            }
        });

        socket.on('clickAllPhotosRes', (pos) => {

            if (pos) {
                clickElement(pos, 1, app);
                getImageUrls(app, socket, io);
            }
            else {
                app.doRestart();
            }
        });

        socket.on('getVKImageRes', (imgUrl) => {
            setTimeout(() => {
                console.log('getVKImageRes URL: ', imgUrl);

                if (imageArray.length === 0) {

                    console.log('Parse finished check images for text');

                    let imageCounter = 0;
                    for (let i = 0; i < imageUrls.length; i++) {

                        console.log('imageUrls I: ', i);

                        checkImageText(imageUrls[i]).subscribe((res) => {

                            console.log(res.body);

                            imageCounter++;

                            if (!res.body.haveText) {
                                if (res.body.imgUrl) {
                                    app.userData.imageUrls.push(res.body.imgUrl);
                                }
                            }

                            if (imageCounter === imageUrls.length) {
                                console.log(app.userData.imageUrls);
                                console.log('Image filter done, store imagesUrls');
                                if (app.userData.imageUrls.length !== 0) {
                                    storeimageUrls(app.userData).subscribe();
                                }
                                app.doRestart();
                            }

                        });

                    }


                }
                else {
                    if (imgUrl) {
                        imageArray.shift();
                        imageUrls.push(imgUrl);
                    }
                    else {
                        console.log('Images Parsed !!!');
                    }

                    console.log('imageUrls');
                    console.log(imageUrls);

                    app.routineState = 'getProfileImg';
                    checkState(app, socket, io);
                }
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