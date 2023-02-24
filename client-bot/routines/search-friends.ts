import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {userGenerator} from "../modules/userGenerator/userGenerator";
import * as robot from 'robotjs';
import {ServerAPI} from '../API/server-connect';

let _ = require('lodash');

export module SearchFriends {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import generateSIDData = userGenerator.generateSIDData;
    import typeText = Robot.typeText;
    import API = ServerAPI.API;

    let nameData$ = Storage.getTopGermanData();
    let data$ = Storage.getRandomSidData({
        haveInitialLikes: {$exists: true},
        imageUrls: {$exists: true},
    });
    let hostData: object;
    let T_TIME = 1000;
    let fbSidData;

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
                            API(app, 'GET', '/fbSids/get').subscribe((data) => {
                                fbSidData = data;
                                console.log('fbUser URL: ', fbSidData);
                                Browser.navigateUrl(io, fbSidData.userUrl);
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
                setTimeout(() => {
                    checkElementFriends(app, socket, io);
                    app.routineState = 'idle';
                }, 4000);
                break;

            case 'parseFriends':
                setTimeout(() => {
                    parseFriends(app, socket, io);
                    app.routineState = 'idle';
                }, 4000);

                break;
        }
    }


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

        setTimeout(() => {
            Robot.doScroll(3);
        }, (T_TIME * 4));

        setTimeout(() => {

            io.emit('getElementClass', {
                response: 'clickFriendRes',
                classText: '._52jh',
                type: 'h3',
                random: true
            });

        }, (T_TIME * 6));

    }


    function clickSearchMenu(app, socket, io) {

        setTimeout(() => {

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

            setTimeout(() => {

                typeText(name);

                setTimeout(() => {

                    robot.keyTap('enter');

                    setTimeout(() => {
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
                    Browser.navigateUrl(io, data.userUrl);
                    app.routineState = 'checkElementFriends';
                })
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
            setTimeout(() => {
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

                setTimeout(() => {
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

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }

}