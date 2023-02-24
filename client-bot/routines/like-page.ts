import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {setTimeout} from "timers";
import {LoginFacebook} from "./login-facebook";
import {Robot} from "../modules/robot/robot";
import {ServerAPI} from "../API/server-connect";

let _ = require('lodash');
let taskID;
let T_TIME = 1000;
let url;
let currTask;
let noPageId = 1;
export module LikePage {
    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import getTask = ServerAPI.getTask;
    import updateTask = ServerAPI.updateTask;
    import sendEvent = ServerAPI.sendEvent;

    export function init(app, socket, io) {
        setListeners(app, socket, io);
    }


    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {
            case 'init':
                getTask(app).subscribe((task) => {

                    console.log('@Task: ', task);
                    currTask = task;
                    taskID = task.taskID;
                    url = task.url;

                    console.log('@TASK: ', task);

                    Storage.getSidByID(task.sid_ID).subscribe((data) => {
                        if (data) {
                            app.userData = data;
                            console.log('@SID: ', data);
                            app.routineState = 'login';
                            checkState(app, socket, io);
                        } else {
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
                LoginFacebook.login$(app, socket, io)
                    .subscribe((res) => {
                        if (res) {
                            console.log('@login done');
                            setTimeout(() => {
                                navigatePage(app, socket, io);
                                checkState(app, socket, io);
                            }, (T_TIME * 6));
                        } else {
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

    function navigatePage(app, socket, io) {
        noPageId = 1;
        console.log('Navigate Page, task TYPE: ', currTask.routine);
        Browser.navigateUrl(io, url);

        setTimeout(() => {

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

                    setTimeout(() => {
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

                    setTimeout(() => {
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
                    setTimeout(() => {
                        updateTask(app, taskID, app.userData._id).subscribe((task) => {
                            console.log('@updateTask RES: ', task.body);
                            app.doRestart();
                        });
                    }, 10000);
                } else {
                    console.log('Start the invite Process');
                    setTimeout(() => {
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

        setTimeout(() => {

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
            } else {
                sendEvent(app, false).subscribe(() => {
                });
            }
            updateTask(app, taskID, app.userData._id).subscribe((task) => {
            });
            setTimeout(() => {
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
                setTimeout(() => {
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

                setTimeout(() => {
                    sendEvent(app, true).subscribe(() => {
                    });
                    updateTask(app, taskID, app.userData._id).subscribe((task) => {
                        console.log('@updateTask RES: ', task.body);
                    });
                    setTimeout(() => {
                        Browser.navigateUrl(io, '?_rdr#!/send_page_invite/?pageid=' + pageID);
                        setTimeout(() => {
                            app.routineState = 'inviteFriends';
                            checkState(app, socket, io);
                        }, 20000);
                    }, 10000);
                }, 2000);
            } else {
                if (noPageId > 1) {
                    app.doRestart();
                }
                noPageId++;
            }
        });

        socket.on('navigateSharePage', (pageID) => {

            console.log('pageID: ', pageID);

            if (pageID) {
                setTimeout(() => {
                    setTimeout(() => {
                        app.routineState = 'idle';
                        let sharePageUrl = `?sid=${pageID}&referrer=pages_feed#!/sharer.php?sid=${pageID}&referrer=pages_feed`;
                        console.log('sharePageUrl: ', sharePageUrl);
                        Browser.navigateUrl(io, sharePageUrl);
                        setTimeout(() => {

                            io.emit('click', {
                                selector: ['#share_submit:visible'],
                                response: 'clickShareNowRes',
                            });
                        }, 8000);

                    }, 6000);

                }, 300);
            } else {
                app.doRestart();
            }
        });

        socket.on('clickInviteFriend', (pos) => {

            setTimeout(() => {
                console.log('clickInviteFriend: pos', pos);

                if (pos) {
                    clickElement(pos, 1, app);

                    setTimeout(() => {

                        io.emit('removeElement', {
                            selector: 'button:disabled',
                            parent: 4
                        });

                        app.routineState = 'inviteFriends';
                        checkState(app, socket, io);
                    }, 2000);

                } else {
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

}

