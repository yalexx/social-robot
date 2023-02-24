"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const userGenerator_1 = require("../modules/userGenerator/userGenerator");
const robot = require("robotjs");
const server_connect_1 = require("../API/server-connect");
let _ = require('lodash');
var SearchFriends;
(function (SearchFriends) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var generateSIDData = userGenerator_1.userGenerator.generateSIDData;
    var typeText = robot_1.Robot.typeText;
    var API = server_connect_1.ServerAPI.API;
    let nameData$ = storage_1.Storage.getTopGermanData();
    let data$ = storage_1.Storage.getRandomSidData({
        haveInitialLikes: { $exists: true },
        imageUrls: { $exists: true },
    });
    let hostData;
    let T_TIME = 1000;
    let fbSidData;
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
                        API(app, 'GET', '/fbSids/get').subscribe((data) => {
                            fbSidData = data;
                            console.log('fbUser URL: ', fbSidData);
                            browser_1.Browser.navigateUrl(io, fbSidData.userUrl);
                            app.routineState = 'checkElementFriends';
                        });
                    }
                    else {
                        app.doRestart();
                    }
                });
                app.routineState = 'inLogin';
                break;
            case 'checkElementFriends':
                timers_1.setTimeout(() => {
                    checkElementFriends(app, socket, io);
                    app.routineState = 'idle';
                }, 4000);
                break;
            case 'parseFriends':
                timers_1.setTimeout(() => {
                    parseFriends(app, socket, io);
                    app.routineState = 'idle';
                }, 4000);
                break;
        }
    }
    SearchFriends.checkState = checkState;
    function parseFriends(app, socket, io) {
        console.log('Start Parse Friends !!!');
        io.emit('parseFriends', {
            response: 'parseFriendsRes'
        });
    }
    function checkUrlFriends(app, socket, io) {
        io.emit('checkUrlContainText', {
            response: 'checkUrlContainFriendsRes',
            text: 'friends',
        });
    }
    function checkUrlPeople(app, socket, io) {
        io.emit('checkUrlContainText', {
            response: 'urlContainsPeople',
            text: 'people',
        });
    }
    function checkElementFriends(app, socket, io) {
        io.emit('textExists', {
            response: 'checkFriendsList',
            text: 'See All Friends',
            type: 'div',
        });
    }
    function clickFriend(app, socket, io) {
        timers_1.setTimeout(() => {
            robot_1.Robot.doScroll(3);
        }, (T_TIME * 4));
        timers_1.setTimeout(() => {
            io.emit('getElementClass', {
                response: 'clickFriendRes',
                classText: '._52jh',
                type: 'h3',
                random: true
            });
        }, (T_TIME * 6));
    }
    function clickSearchMenu(app, socket, io) {
        timers_1.setTimeout(() => {
            getDomElementPosition(io, {
                response: 'clickSearchMenu',
                text: 'Search',
                type: 'span',
                position: 0
            });
        }, (T_TIME * 8));
    }
    function searchFriends(app, socket, io) {
        nameData$.subscribe((data) => {
            hostData = generateSIDData(data, 'gmx.net');
            let name = hostData['name'] + ' ' + hostData['familyName'];
            console.log('@Host name: ', name);
            timers_1.setTimeout(() => {
                typeText(name);
                timers_1.setTimeout(() => {
                    robot.keyTap('enter');
                    timers_1.setTimeout(() => {
                        /*clickPeople(app, socket, io);*/
                    }, (T_TIME * 3));
                }, (T_TIME * 3));
            }, (T_TIME * 4));
        });
        app.routineState = 'idle';
    }
    function setListeners(app, socket, io) {
        socket.on('checkFriendsList', (res) => {
            console.log('@checkFriendsList: ', res);
            if (res.exists) {
                io.emit('getElementClass', {
                    response: 'clickFriendsList',
                    classText: '._4g34._1hb',
                    type: 'div',
                    position: 2
                });
            }
            else {
                API(app, 'POST', '/fbSids/friendsParsed', {
                    id: fbSidData._id
                }).subscribe((data) => {
                    console.log('friendsParsed: ', data);
                });
                API(app, 'GET', '/fbSids/get').subscribe((data) => {
                    console.log('fbUser URL: ', data);
                    browser_1.Browser.navigateUrl(io, data.userUrl);
                    app.routineState = 'checkElementFriends';
                });
            }
        });
        socket.on('urlContainsPeople', (res) => {
            console.log('urlContainsPeople:', res);
            if (res) {
                app.routineState = 'selectGermany';
                checkState(app, socket, io);
            }
        });
        socket.on('checkIfProfilePage', (res) => {
            console.log('@checkIfProfilePage: ', res);
            if (res.exists) {
                checkElementFriends(app, socket, io);
            }
        });
        socket.on('clickFriendsList', (res) => {
            res.precise = true;
            clickElement(res, 1, app);
            app.routineState = 'parseFriends';
            timers_1.setTimeout(() => {
                checkState(app, socket, io);
            }, 4000);
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('clickCancel', (pos) => {
            if (pos) {
                pos.top = 465;
                clickElement(pos, 1, app);
            }
        });
        socket.on('parseFriendsRes', (res) => {
            console.log('parseFriendsRes: ', res);
            if (res) {
                API(app, 'POST', '/fbSids/save', {
                    facebookID: res.profileID,
                    name: res.firstName,
                    familyName: res.lastName,
                    userUrl: res.profileUrl,
                    parseDate: new Date(),
                }).subscribe((data) => {
                    console.log('fbSids Stored: ', data);
                });
                timers_1.setTimeout(() => {
                    console.log('Send parse again');
                    parseFriends(app, socket, io);
                }, 300);
            }
            else {
                API(app, 'POST', '/fbSids/friendsParsed', {
                    id: fbSidData._id
                }).subscribe((data) => {
                    console.log('friendsParsed: ', data.profileID);
                });
                app.doRestart();
            }
        });
    }
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    SearchFriends.init = init;
})(SearchFriends = exports.SearchFriends || (exports.SearchFriends = {}));
