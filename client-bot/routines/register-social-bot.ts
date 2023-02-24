import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import * as fs from "fs";
import {Robot} from "../modules/robot/robot";
import request = require("request");
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Utils} from "../modules/utils/unitls";

let request = require('request');
let _ = require('lodash');

export module RegisterSocialbot {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import updateSidID = Storage.updateSidID;

    let data$ = Storage.getRandomSidData({
        isVerified: true,
        provider: {$ne: "abv.bg"},
        sidID: {$not: {$exists: true}},
    });
    let T_TIME = 1000;


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
                }, (T_TIME * 3));
                break;
        }
    }

    export function init(app, socket, io) {
        setListeners(app, socket, io);
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
        }, (T_TIME * 4));
    }

    function clickNewProfileImage(app, socket, io) {

        setTimeout(() => {

            setTimeout(() => {
                getDomElementPosition(io, {
                    response: 'clickNewProfileImage',
                    selectClass: '_4_yr',
                });
            }, (T_TIME * 4));


        }, (T_TIME * 10));


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

        }, (T_TIME * 4));


    }

    function uploadPicture(app, socket, io) {

        setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 2));
    }

    function getProfileUrl(app, socket, io) {

        setTimeout(() => {
            io.emit('getCurrentLocation', {
                response: 'getCurrentLocationRes'
            });
        }, (T_TIME * 6));
    }

    function registerNewAccount(app, socket, io, href) {


        let profileUrl = prepareUrl(href);

        console.log('@prepareUrl profileUrl: ', profileUrl);

        let registerUrl = 'http://socialtrack.fan-factory.com/' +
            'register?wid=' +
            '3131&locale=' +
            'de_DE&kamptype=1' +
            '&par=' + profileUrl;


        request(registerUrl, (error, response, body) => {

            if (body) {

                let registerResponse = JSON.parse(body);

                if (registerResponse.sid_access) {
                    let SidID = registerResponse.sid_access.sid;
                    updateDatabase(app, socket, io, SidID);
                }
            }
            else {
                app.doRestart();
            }
        });

    }

    function prepareUrl(url) {
        let fixedHref = url.slice(10);
        let n = fixedHref.indexOf('?');
        fixedHref = fixedHref.substring(0, n != -1 ? n : fixedHref.length);
        return 'http://' + fixedHref;
    }


    function updateDatabase(app, socket, io, SidID) {

        setTimeout(() => {

            updateSidID(app.userData._id, SidID).subscribe((res) => {
                app.doRestart();
            });

        }, (T_TIME * 3));
    }

    function setListeners(app, socket, io) {

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });

        socket.on('getCurrentLocationRes', (res) => {
            registerNewAccount(app, socket, io, res.url);
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

        socket.on('enterProfile', (pos) => {
            console.log('@enterProfile pos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                getProfileUrl(app, socket, io);
            }
            else {
                console.log('@enterProfile pos bug: ', pos);
            }
        });
    }
}