"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const timers_1 = require("timers");
const login_facebook_1 = require("./login-facebook");
const robot_1 = require("../modules/robot/robot");
const server_connect_1 = require("../API/server-connect");
let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url;
let currTask;
let noPageId = 1;
var LikePage;
(function (LikePage) {
    var getDomElementPosition = browser_1.Browser.getDomElementPosition;
    var clickElement = robot_1.Robot.clickElement;
    var getTask = server_connect_1.ServerAPI.getTask;
    var updateTask = server_connect_1.ServerAPI.updateTask;
    var sendEvent = server_connect_1.ServerAPI.sendEvent;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    LikePage.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        switch (app.routineState) {
            case 'init':
                getTask(app).subscribe((task) => {
                    console.log('@Task: ', task);
                    currTask = task;
                    taskID = task.taskID;
                    url = task.url;
                    console.log('@TASK: ', task);
                    storage_1.Storage.getSidByID(task.sid_ID).subscribe((data) => {
                        if (data) {
                            app.userData = data;
                            console.log('@SID: ', data);
                            app.routineState = 'login';
                            checkState(app, socket, io);
                        }
                        else {
                            updateTask(app, taskID, task.sid_ID).subscribe((task) => {
                                console.log('@updateTask RES: ', task.body);
                            });
                            console.log('@SID not found remove from tasks');
                            app.doRestart();
                        }
                    });
                });
                app.routineState = 'idle';
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
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'idle':
                console.log('@API Like Page Idle');
                break;
            case 'inviteFriends':
                inviteFriends(app, socket, io);
                break;
        }
    }
    LikePage.checkState = checkState;
    function navigatePage(app, socket, io) {
        noPageId = 1;
        console.log('Navigate Page, task TYPE: ', currTask.routine);
        browser_1.Browser.navigateUrl(io, url);
        timers_1.setTimeout(() => {
            io.emit('textExists', {
                response: 'missingUrlRes',
                text: 'The page you requested',
                type: 'div'
            });
            switch (currTask.routine) {
                case 'pageLike':
                    pageLike(app, socket, io);
                    break;
                case 'postShare':
                    io.emit('click', {
                        selector: ['a[data-sigil="share-popup"]:visible'],
                        response: '',
                    });
                    timers_1.setTimeout(() => {
                        io.emit('click', {
                            selector: ['a[data-sigil="touchable touchable share-one-click-button"]'],
                            response: 'clickShareNowRes',
                        });
                    }, 2000);
                    break;
                case 'postLike':
                    io.emit('getActionBtnPos', {
                        type: 'a',
                        text: 'Like',
                        response: 'clickLikeRes',
                    });
                    timers_1.setTimeout(() => {
                        updateTask(app, taskID, app.userData._id).subscribe((task) => {
                            console.log('@updateTask postLike RES: ', task.body);
                            app.doRestart();
                        });
                    }, 3000);
                    break;
                case 'pageShare':
                    io.emit('getPageID', {
                        response: 'navigateSharePage',
                    });
                    break;
                default:
                    console.log('Wrong task routine, try pageLike');
                    pageLike(app, socket, io);
            }
            function pageLike(app, socket, io) {
                console.log('currTask.skipLike ', currTask.skipLike);
                if (!currTask.skipLike) {
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Like',
                        response: 'clickLikeRes',
                    });
                }
                console.log('currTask.skipInvite ', currTask.skipInvite);
                if (currTask.skipInvite === true) {
                    timers_1.setTimeout(() => {
                        updateTask(app, taskID, app.userData._id).subscribe((task) => {
                            console.log('@updateTask RES: ', task.body);
                            app.doRestart();
                        });
                    }, 10000);
                }
                else {
                    console.log('Start the invite Process');
                    timers_1.setTimeout(() => {
                        io.emit('getPageID', {
                            response: 'visitInvite',
                        });
                    }, 13000);
                }
            }
        }, (T_TIME * 20));
    }
    function inviteFriends(app, socket, io) {
        console.log('inviteFriends');
        timers_1.setTimeout(() => {
            io.emit('getElementPos', {
                type: 'span',
                text: 'Invite',
                response: 'clickInviteFriend',
            });
        }, 3500);
    }
    function clickFollow(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickFollow',
            text: 'Follow',
            type: 'span'
        });
    }
    function clickSeeFirst(app, socket, io) {
        getDomElementPosition(io, {
            response: 'clickSeeFirst',
            text: 'See First',
            type: 'span'
        });
    }
    function setListeners(app, socket, io) {
        socket.on('clickLikeRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickShareNowRes', (exists) => {
            if (exists) {
                sendEvent(app, true).subscribe(() => {
                });
            }
            else {
                sendEvent(app, false).subscribe(() => {
                });
            }
            updateTask(app, taskID, app.userData._id).subscribe((task) => {
            });
            timers_1.setTimeout(() => {
                app.doRestart();
            }, 3000);
        });
        socket.on('missingUrlRes', (res) => {
            if (res.exists) {
                console.log('Missing url!!!!!!');
                updateTask(app, taskID, app.userData._id).subscribe();
                sendEvent(app, false).subscribe();
            }
        });
        socket.on('clickFollow', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    clickSeeFirst(app, socket, io);
                }, (T_TIME * 5));
            }
        });
        socket.on('clickSeeFirst', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('visitInvite', (pageID) => {
            console.log('visitInvite PAGEID: ', pageID);
            if (pageID) {
                timers_1.setTimeout(() => {
                    sendEvent(app, true).subscribe(() => {
                    });
                    updateTask(app, taskID, app.userData._id).subscribe((task) => {
                        console.log('@updateTask RES: ', task.body);
                    });
                    timers_1.setTimeout(() => {
                        browser_1.Browser.navigateUrl(io, '?_rdr#!/send_page_invite/?pageid=' + pageID);
                        timers_1.setTimeout(() => {
                            app.routineState = 'inviteFriends';
                            checkState(app, socket, io);
                        }, 20000);
                    }, 10000);
                }, 2000);
            }
            else {
                if (noPageId > 1) {
                    app.doRestart();
                }
                noPageId++;
            }
        });
        socket.on('navigateSharePage', (pageID) => {
            console.log('pageID: ', pageID);
            if (pageID) {
                timers_1.setTimeout(() => {
                    timers_1.setTimeout(() => {
                        app.routineState = 'idle';
                        let sharePageUrl = `?sid=${pageID}&referrer=pages_feed#!/sharer.php?sid=${pageID}&referrer=pages_feed`;
                        console.log('sharePageUrl: ', sharePageUrl);
                        browser_1.Browser.navigateUrl(io, sharePageUrl);
                        timers_1.setTimeout(() => {
                            io.emit('click', {
                                selector: ['#share_submit:visible'],
                                response: 'clickShareNowRes',
                            });
                        }, 8000);
                    }, 6000);
                }, 300);
            }
            else {
                app.doRestart();
            }
        });
        socket.on('clickInviteFriend', (pos) => {
            timers_1.setTimeout(() => {
                console.log('clickInviteFriend: pos', pos);
                if (pos) {
                    clickElement(pos, 1, app);
                    timers_1.setTimeout(() => {
                        io.emit('removeElement', {
                            selector: 'button:disabled',
                            parent: 4
                        });
                        app.routineState = 'inviteFriends';
                        checkState(app, socket, io);
                    }, 2000);
                }
                else {
                    updateTask(app, taskID, app.userData._id).subscribe((task) => {
                        console.log('@updateTask RES: ', task.body);
                    });
                    app.doRestart();
                    console.log('All invited');
                }
            }, 2000);
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(LikePage = exports.LikePage || (exports.LikePage = {}));
