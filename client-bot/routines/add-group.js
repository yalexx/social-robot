"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
const robot = require("robotjs");
let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url = 'https://www.facebook.com/groups/1985703248170300';
var AddGroup;
(function (AddGroup) {
    var clickElement = robot_1.Robot.clickElement;
    var updateGroupInvited = storage_1.Storage.updateGroupInvited;
    let data$;
    let invites = 0;
    let totalInvites = 0;
    function init(app, socket, io) {
        setListeners(app, socket, io);
        data$ = storage_1.Storage.getRandomSidData({
            "lastAddFriends": { $exists: true },
            "group": 2,
            "groupInvited": { $ne: 2 },
            "isVerified": true,
        });
        /* data$ = Storage.getSidByID('5bc7685d72e3bc2e3388cac2');*/
    }
    AddGroup.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                invites = 0;
                totalInvites = 0;
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData._id);
                    console.log('@email:', app.userData.registerEmail);
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
                            navigatePage(app, socket, io);
                            checkState(app, socket, io);
                        }, (T_TIME * 3));
                    }
                    else {
                        console.log('@no login do restart');
                        app.routineState = 'init';
                        app.doRestart();
                    }
                }, (err) => {
                    console.log('@login error: ', err);
                });
                app.routineState = 'inLogin';
                break;
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'inviteFriends':
                timers_1.setTimeout(() => {
                    inviteFriends(app, socket, io);
                }, 3000);
                break;
            case 'idle':
                console.log('@API Like Page Idle 1');
                break;
        }
    }
    AddGroup.checkState = checkState;
    function navigatePage(app, socket, io) {
        browser_1.Browser.navigateUrl(io, url);
        timers_1.setTimeout(() => {
            io.emit('click', {
                selector: ['a[aria-label="Add Members"]:visible'],
                response: 'clickInviteRes',
            });
            app.routineState = 'inviteFriends';
            checkState(app, socket, io);
        }, (T_TIME * 15));
    }
    function inviteFriends(app, socket, io) {
        console.log('inviteFriends to Group');
        console.log('invites: ', invites);
        console.log('totalInvites: ', totalInvites);
        if (invites > _.random(6, 9)) {
            robot.keyTap('f5');
            invites = 0;
            timers_1.setTimeout(() => {
                inviteFriends(app, socket, io);
            }, 4000);
        }
        else {
            if (totalInvites < _.random(20, 60)) {
                timers_1.setTimeout(() => {
                    io.emit('click', {
                        selector: ['button[value="Add"]:first:visible'],
                        response: 'clickInviteFriend',
                    });
                }, _.random(2000, 4000));
            }
            else {
                app.doRestart();
            }
        }
    }
    function setListeners(app, socket, io) {
        socket.on('clickInviteFriend', (exists) => {
            console.log('clickInviteFriend: exists', exists);
            if (exists) {
                timers_1.setTimeout(() => {
                    io.emit('removeElement', {
                        selector: 'button[value="Added"]:first',
                        parent: 4
                    });
                    invites++;
                    totalInvites++;
                    timers_1.setTimeout(() => {
                        inviteFriends(app, socket, io);
                    }, _.random(6000, 10000));
                }, 700);
            }
            else {
                timers_1.setTimeout(() => {
                    updateGroupInvited(app.userData._id).subscribe();
                    app.doRestart();
                    console.log('All invited');
                }, 4000);
            }
        });
        socket.on('clickInviteRes', (exists) => {
            if (!exists) {
                app.doRestart();
            }
        });
        socket.on('clickSeeFirst', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(AddGroup = exports.AddGroup || (exports.AddGroup = {}));
