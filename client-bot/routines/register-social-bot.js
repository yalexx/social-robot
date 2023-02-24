"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
let request = require('request');
let _ = require('lodash');
var RegisterSocialbot;
(function (RegisterSocialbot) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var updateSidID = storage_1.Storage.updateSidID;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        provider: { $ne: "abv.bg" },
        sidID: { $not: { $exists: true } },
    });
    let T_TIME = 1000;
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
                timers_1.setTimeout(() => {
                    login_facebook_1.LoginFacebook.login$(app, socket, io).subscribe((res) => {
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
                timers_1.setTimeout(() => {
                    enterProfile(app, socket, io);
                }, (T_TIME * 3));
                break;
        }
    }
    RegisterSocialbot.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    RegisterSocialbot.init = init;
    function clickProfileMenu(app, socket, io) {
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
            getDomElementPosition(io, {
                response: 'enterProfile',
                selectClass: '_4ut2',
            });
        }, (T_TIME * 4));
    }
    function clickNewProfileImage(app, socket, io) {
        timers_1.setTimeout(() => {
            timers_1.setTimeout(() => {
                getDomElementPosition(io, {
                    response: 'clickNewProfileImage',
                    selectClass: '_4_yr',
                });
            }, (T_TIME * 4));
        }, (T_TIME * 10));
    }
    function clickProfileImage(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickProfileImage',
                selectClass: 'profpic',
            });
        }, (T_TIME * 6));
    }
    function changeProfilePick(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'changeProfilePick',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 4));
    }
    function uploadPicture(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'uploadPicture',
                id: 'nuxChoosePhotoButton'
            });
        }, (T_TIME * 2));
    }
    function getProfileUrl(app, socket, io) {
        timers_1.setTimeout(() => {
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
        timers_1.setTimeout(() => {
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
})(RegisterSocialbot = exports.RegisterSocialbot || (exports.RegisterSocialbot = {}));
