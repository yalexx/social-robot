import {Browser} from "../../modules/browser/browser";
import {Storage} from "../../modules/storage/storage";
import {Robot} from "../../modules/robot/robot";
import {setTimeout} from "timers";
import {API} from "../../modules/api/api";
import Request = require("request");
import {LoginFacebook} from "../login-facebook";
import {CampType} from "./interface/camp-types";
import * as robot from 'robotjs';
import {ServerAPI} from "../../API/server-connect";
let _ = require('lodash');

export module StoreAction {

    import clickElement = Robot.clickElement;
    import getDomElementPosition = Browser.getDomElementPosition;
    import sendEvent = ServerAPI.sendEvent;
    import storeActionUrl = Storage.storeActionUrl;

    let data$;
    let T_TIME = 1000;
    let count;
    let reviewText: string;
    let kid;
    let requestURL;

    let actionArray = [
        CampType.fanpage_fans,
        CampType.foto_video_likes,
        CampType.reviews,
        CampType.event_participations
    ];

    export function init(app, socket, io) {
        data$ = Storage.getRandomSidData({
            cookie: {$not: /.*null.*/i}, $and: [{"cookie": {$exists: true}}],
            sidID: {$exists: true},
            sidVerify: {$exists: true}
        });
        setListeners(app, socket, io);

        if (!app.containerData.randomAction) {
            app.currentAction = app.containerData.actionId;
        }
    }

    export function checkState(app, socket, io) {
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

    function getRandomAction(app) {
        if (app.containerData.randomAction) {
            let actionArrayID = _.random(0, (actionArray.length - 1));
            console.log('Action Array ID: ', actionArrayID);
            app.currentAction = actionArray[actionArrayID];
            console.log('Random Action chosen ID: ', app.currentAction);
        }
    }

    function validate(app, callback) {

        let api = new API(Request);

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

                setTimeout(() => {

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

        let api = new API(Request);
        getRandomAction(app);

        api.getActions(app.userData.sidID, app.currentAction).subscribe((res) => {
            if (res === null) {
                console.log('@No action, next SID.');
                app.routineState = 'init';

                setTimeout(() => {
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

                        if (pageID === null) app.doRestart();
                        console.log('@res from get target:', pageID);
                        requestURL = `https://m.facebook.com/${pageID}`;

                        console.log('Store Url !!!');
                        storeActionUrl(requestURL).subscribe((res)=>{
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

        setTimeout(() => {
            io.emit('textExists', {
                response: 'removePage',
                text: 'The page you requested',
                type: 'div'
            });
        }, 12000);

    }

    function likePage(app, socket, io) {

        setTimeout(() => {

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

        setTimeout(() => {

            validate(app, (res) => {
                if (res) {
                    io.emit('getElementPosText', {
                        response: 'likePageRes',
                        text: 'Going',
                        type: 'span',
                    });
                }
                else {
                    app.doRes
                }

            });


        }, (T_TIME * _.random(8, 10)));
    }

    function reviews(app, socket, io) {
        reviewText = null;

        setTimeout(() => {

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

        setTimeout(() => {


            if (reviewText !== null) {
                console.log('Paste review text in form.');
                io.emit('setValue', {
                    selector: 'textarea[data-sigil="composer-textarea m-textarea-input"]',
                    val: reviewText
                });
                setTimeout(() => {
                    robot.keyTap('space');
                }, 2000);

            }

            setTimeout(() => {
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

        setTimeout(() => {

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
                new API(Request).actionGood(app.userData.sidID, kid, false);
                app.doRestart();
            }
            else {
                console.log('@app.currentAction: ', app.currentAction);
                switch (app.currentAction) {

                    case CampType.fanpage_fans:
                        likePage(app, socket, io);
                        break;
                    case CampType.foto_video_likes:
                        fotoVideoLikes(app, socket, io);
                        break;
                    case CampType.event_participations:
                        eventParticipation(app, socket, io);
                        break;
                    case CampType.reviews:
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

            setTimeout(() => {
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
                setTimeout(() => {
                    app.doRestart();
                }, 25000);
            }

        });

        socket.on('clickReviewRes', (pos) => {

            console.log('@clickReviewRes');

            if (pos) {

                clickElement(pos, 1, app);

                setTimeout(() => {
                    clickStar(app, socket, io);
                }, 8000);

                let api = new API(Request);
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

                    setTimeout(() => {
                        io.emit('getElementPos', {
                            response: 'clickUnlikeTextRes',
                            text: 'Unlike',
                            type: 'span',
                        });
                    }, 3000);

                }
            }
        );

        socket.on('clickUnlikeTextRes', (pos) => {
                console.log('@Click unlike text pos: ', pos);
                if (pos && pos.top !== 0) {
                    clickElement(pos, 1, app);
                }
            }
        );

        socket.on('clickStarRes', (pos) => {

            if (pos) {

                clickElement(pos, 1, app);

                io.emit('getElementPos', {
                    response: 'clickPublicRes',
                    text: 'Public',
                    type: 'div',
                });


                setTimeout(() => {
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
                setTimeout(() => {
                    app.doRestart();
                }, 25000);
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
    }
}