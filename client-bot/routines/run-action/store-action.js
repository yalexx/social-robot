"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../../modules/storage/storage");
const robot_1 = require("../../modules/robot/robot");
const timers_1 = require("timers");
const api_1 = require("../../modules/api/api");
const Request = require("request");
const camp_types_1 = require("./interface/camp-types");
const robot = require("robotjs");
let _ = require('lodash');
var StoreAction;
(function (StoreAction) {
    var clickElement = robot_1.Robot.clickElement;
    var storeActionUrl = storage_1.Storage.storeActionUrl;
    let data$;
    let T_TIME = 1000;
    let count;
    let reviewText;
    let kid;
    let requestURL;
    let actionArray = [
        camp_types_1.CampType.fanpage_fans,
        camp_types_1.CampType.foto_video_likes,
        camp_types_1.CampType.reviews,
        camp_types_1.CampType.event_participations
    ];
    function init(app, socket, io) {
        data$ = storage_1.Storage.getRandomSidData({
            cookie: { $not: /.*null.*/i }, $and: [{ "cookie": { $exists: true } }],
            sidID: { $exists: true },
            sidVerify: { $exists: true }
        });
        setListeners(app, socket, io);
        if (!app.containerData.randomAction) {
            app.currentAction = app.containerData.actionId;
        }
    }
    StoreAction.init = init;
    function checkState(app, socket, io) {
        console.log('@Current State: ', app.routineState);
        console.log('@Current Action: ', app.currentAction);
        switch (app.routineState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@user:', app.userData._id);
                    console.log('@email:', app.userData.registerEmail);
                    getActions(app, socket, io);
                });
                app.routineState = 'idle';
                break;
            case 'login':
                app.loginState = 'init';
                break;
            case 'inLogin':
                console.log('Still not logged in.');
                break;
            case 'doAction':
                doAction(app, socket, io);
                app.routineState = 'idle';
                break;
        }
    }
    StoreAction.checkState = checkState;
    function getRandomAction(app) {
        if (app.containerData.randomAction) {
            let actionArrayID = _.random(0, (actionArray.length - 1));
            console.log('Action Array ID: ', actionArrayID);
            app.currentAction = actionArray[actionArrayID];
            console.log('Random Action chosen ID: ', app.currentAction);
        }
    }
    function validate(app, callback) {
        let api = new api_1.API(Request);
        api.startTracking(app.userData.sidID, kid).subscribe((res) => {
            console.log('1. Open Before Start Tracking res: ', res);
            console.log('res type', typeof res);
            if (res.indexOf('E') > -1) {
                console.log('Validation Request Count ERROR ("E"); !!!');
                callback(false);
            }
            else {
                let time = new Date();
                console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
                count = getCount(res);
                callback(true);
                timers_1.setTimeout(() => {
                    api.startTracking(app.userData.sidID, kid).subscribe((res) => {
                        console.log('2. Open After Like Tracking res: ', res);
                        let time = new Date();
                        console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
                        api.afterActionFinished(kid, app.userData.sidID, count).subscribe((res) => {
                            app.doRestart();
                        });
                    });
                }, (T_TIME * 20));
            }
        });
    }
    function getActions(app, socket, io) {
        let api = new api_1.API(Request);
        getRandomAction(app);
        api.getActions(app.userData.sidID, app.currentAction).subscribe((res) => {
            if (res === null) {
                console.log('@No action, next SID.');
                app.routineState = 'init';
                timers_1.setTimeout(() => {
                    checkState(app, socket, io);
                }, 500);
            }
            else {
                kid = res[_.random(0, (res.length - 1))].id;
                console.log('@KID: ', kid);
                if (kid === undefined) {
                    app.doRestart();
                }
                else {
                    console.log('@SID: ', app.userData.sidID);
                    api.getTarget(kid).subscribe((pageID) => {
                        if (pageID === null)
                            app.doRestart();
                        console.log('@res from get target:', pageID);
                        requestURL = `https://m.facebook.com/${pageID}`;
                        console.log('Store Url !!!');
                        storeActionUrl(requestURL).subscribe((res) => {
                            console.log(res);
                        });
                        console.log(requestURL);
                        app.routineState = 'init';
                        checkState(app, socket, io);
                    });
                }
            }
        });
    }
    function doAction(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('textExists', {
                response: 'removePage',
                text: 'The page you requested',
                type: 'div'
            });
        }, 12000);
    }
    function likePage(app, socket, io) {
        timers_1.setTimeout(() => {
            validate(app, (res) => {
                if (res) {
                    io.emit('getActionBtnPos', {
                        type: 'div',
                        text: 'Like',
                        response: 'likePageRes',
                    });
                }
                else {
                    app.doRestart();
                }
            });
        }, 10000);
    }
    function eventParticipation(app, socket, io) {
        timers_1.setTimeout(() => {
            validate(app, (res) => {
                if (res) {
                    io.emit('getElementPosText', {
                        response: 'likePageRes',
                        text: 'Going',
                        type: 'span',
                    });
                }
                else {
                    app.doRes;
                }
            });
        }, (T_TIME * _.random(8, 10)));
    }
    function reviews(app, socket, io) {
        reviewText = null;
        timers_1.setTimeout(() => {
            io.emit('getElementPos', {
                response: 'clickReviewRes',
                text: 'Reviews',
                type: 'span',
                position: 0,
            });
        }, 8000);
    }
    function clickStar(app, socket, io) {
        io.emit('getElementPos', {
            response: 'clickStarRes',
            selector: 'a[data-sigil="star-link ajaxify"]:nth-child(5)',
        });
    }
    function clickPost(app, socket, io) {
        timers_1.setTimeout(() => {
            if (reviewText !== null) {
                console.log('Paste review text in form.');
                io.emit('setValue', {
                    selector: 'textarea[data-sigil="composer-textarea m-textarea-input"]',
                    val: reviewText
                });
                timers_1.setTimeout(() => {
                    robot.keyTap('space');
                }, 2000);
            }
            timers_1.setTimeout(() => {
                io.emit('getElementPos', {
                    response: 'clickPostRes',
                    text: 'Post',
                    type: 'button',
                    position: 0,
                });
            }, 10000);
        }, 3000);
    }
    function fotoVideoLikes(app, socket, io) {
        timers_1.setTimeout(() => {
            validate(app, () => {
                io.emit('getElementPos', {
                    response: 'likePageRes',
                    selector: 'a[data-sigil="touchable ufi-inline-like like-reaction-flyout"]',
                });
            });
        }, (T_TIME * _.random(8, 10)));
    }
    function getCount(text) {
        let regExp = /\(([^)]+)\)/;
        let matches = regExp.exec(text);
        if (matches !== null) {
            return matches[1];
        }
        else {
            return false;
        }
    }
    function setListeners(app, socket, io) {
        socket.on('removePage', (res) => {
            if (res.exists) {
                new api_1.API(Request).actionGood(app.userData.sidID, kid, false);
                app.doRestart();
            }
            else {
                console.log('@app.currentAction: ', app.currentAction);
                switch (app.currentAction) {
                    case camp_types_1.CampType.fanpage_fans:
                        likePage(app, socket, io);
                        break;
                    case camp_types_1.CampType.foto_video_likes:
                        fotoVideoLikes(app, socket, io);
                        break;
                    case camp_types_1.CampType.event_participations:
                        eventParticipation(app, socket, io);
                        break;
                    case camp_types_1.CampType.reviews:
                        reviews(app, socket, io);
                        break;
                }
            }
        });
        socket.on('likePageRes', (pos) => {
            if (pos && pos.top !== 0) {
                pos.precise = true;
                clickElement(pos, 1, app);
            }
            else {
                console.log('Like button not found');
            }
            timers_1.setTimeout(() => {
                app.doRestart();
            }, 25000);
        });
        socket.on('clickPublicRes', (pos) => {
            console.log('Click Public');
            if (pos) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('reviewsRes', (pos) => {
            if (pos) {
                validate(app, () => {
                    pos.precise = true;
                    clickElement(pos, 1, app);
                });
            }
            else {
                timers_1.setTimeout(() => {
                    app.doRestart();
                }, 25000);
            }
        });
        socket.on('clickReviewRes', (pos) => {
            console.log('@clickReviewRes');
            if (pos) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    clickStar(app, socket, io);
                }, 8000);
                let api = new api_1.API(Request);
                api.startTracking(app.userData.sidID, kid).subscribe((res) => {
                    if (res === 'E') {
                        console.log('Tracking E, Restart');
                        app.doRestart();
                    }
                    let time = new Date();
                    console.log(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds());
                    console.log("RES STRING: ", res);
                    if (!getCount(res)) {
                        let parsedRes = JSON.parse(res);
                        count = parsedRes.count;
                        reviewText = parsedRes.text;
                        console.log('parsedRes: ', parsedRes);
                        console.log('reviewText: ', reviewText);
                        console.log('parsedRes count: ', parsedRes.count);
                    }
                    else {
                        console.log('@no review text: ', res.text);
                        count = getCount(res);
                        console.log('Count is: ', count);
                        if (count === '"E"') {
                            app.doRestart();
                        }
                    }
                });
            }
            else {
                app.doRestart();
            }
        });
        socket.on('unlikePageRes', (pos) => {
            console.log('@Click unlike pos: ', pos);
            if (pos && pos.top !== 0) {
                clickElement(pos, 1, app);
                timers_1.setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'clickUnlikeTextRes',
                        text: 'Unlike',
                        type: 'span',
                    });
                }, 3000);
            }
        });
        socket.on('clickUnlikeTextRes', (pos) => {
            console.log('@Click unlike text pos: ', pos);
            if (pos && pos.top !== 0) {
                clickElement(pos, 1, app);
            }
        });
        socket.on('clickStarRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                io.emit('getElementPos', {
                    response: 'clickPublicRes',
                    text: 'Public',
                    type: 'div',
                });
                timers_1.setTimeout(() => {
                    clickPost(app, socket, io);
                }, 9000);
            }
        });
        socket.on('clickPostRes', (pos) => {
            if (pos) {
                clickElement(pos, 1, app);
                validate(app, () => {
                    pos.precise = true;
                });
            }
            else {
                timers_1.setTimeout(() => {
                    app.doRestart();
                }, 25000);
            }
        });
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
})(StoreAction = exports.StoreAction || (exports.StoreAction = {}));
