import {Browser} from "../../modules/browser/browser";
import {Robot} from "../../modules/robot/robot";
import {Storage} from "../../modules/storage/storage";
import {LoginFacebook} from "../login-facebook";
import {setTimeout} from "timers";
import moment = require('moment');

let request = require('request');
let _ = require('lodash');
let scrollCount = 1;
export module ParseSidLikes {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import doScroll = Robot.doScroll;
    import updateParsedLikes = Storage.updateParsedLikes;

    let T_TIME = 1000;
    let likesUrlsCount = 0;
    let urlsArray = [];
    let idsArray = [];
    let data$;

    export function checkState(app, socket, io) {

        console.log('@Current State: ', app.routineState);

        switch (app.routineState) {

            case 'init':
                urlsArray = [];
                idsArray = [];
                likesUrlsCount = 0;
                scrollCount = 1;
                data$ = Storage.getRandomSidData(
                    {
                        $or: [{
                            $and: [{
                                "sidID": {
                                    $exists: true
                                }
                            }, {
                                $or: [{"parsedLikes": moment().subtract(30, 'd').toDate()},
                                    {
                                        "parsedLikes": {$exists: false}
                                    }]
                            }]
                        }]
                    }
                );

                data$.subscribe((data) => {

                    console.log('Last Date: ', moment().subtract(30, 'd').toDate());

                    if (data._id) {
                        app.userData = data;
                        console.log('@user:', app.userData._id);
                        console.log('@email:', app.userData.registerEmail);
                    }
                    else {
                        app.doRestart();
                    }
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
            case 'getPageID':
                console.log('Send get page ID:');
                io.emit('getFBPageID', {
                    response: 'getFBPageIDRes',
                });
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


            /*io.emit('getElementPos', {
             response: 'enterProfileRes',
             text: app.userData.name,
             clickElements: 'ul > li > div > a > div',
             });*/

            getDomElementPosition(io, {
                response: 'enterProfileRes',
                selectClass: '_4ut2',
            });
        }, (T_TIME * 6));
    }

    function skipPage(app, socket, io) {


        setTimeout(() => {

            getDomElementPosition(io, {
                response: 'enterProfileTextRes',
                text: 'View Profile',
                type: 'span'
            });

            setTimeout(() => {
                console.log('@CLICK NEXT');
                getDomElementPosition(io, {
                    response: 'enterProfileTextRes',
                    text: 'Next',
                    type: 'a'
                });
            }, 4000);

        }, (T_TIME * 6));

    }

    function clickUpdateInfo(app, socket, io) {

        console.log('@click update info');

        setTimeout(() => {

            io.emit('getElementPos', {
                response: 'clickUpdateInfoRes',
                text: 'Update Info',
                type: 'span',
            });


        }, (T_TIME * 7));

    }

    function clickLikesTab(app, scoket, io) {

        doScroll(3, () => {


            setTimeout(() => {
                io.emit('getElementPosText', {
                    response: 'clickLikesTabRes',
                    text: 'Likes',
                    clickElements: 'header > div > div > div',
                });
            }, 3000);


        });

    }

    function clickAllLike(app, socket, io) {

        console.log('@clickAllLike');

        setTimeout(() => {

            io.emit('getElementPosText', {
                response: 'clickAllLikeRes',
                text: 'All Likes',
                clickElements: 'header > div > div > div > div > div',
            });
        }, 6000);

    }

    function parseLikes(app, socket, io) {
        console.log('@Start parse likes');

        setTimeout(() => {

            io.emit('getLikesUrls', {
                response: 'parseLikesRes',
                childId: likesUrlsCount
            })
            ;

        }, 300);
    }

    function checkCurrentFacebookPage(app, socket, io) {

        setTimeout(() => {

            io.emit('textExists', {
                response: 'textExistsRes',
                text: 'Professional Skills',
                type: 'div'
            });

        }, (T_TIME * 3));
    }

    function getIDs(app, socket, io) {

        console.log('likesUrlsCount in getIDs: ', likesUrlsCount);
        if (likesUrlsCount > 0) {

            console.log('urlsArray: ', urlsArray);
            getPageID(app, socket, io, urlsArray[(likesUrlsCount - 1)]);
            likesUrlsCount--;
        }
        else {
            console.log('Parse Done send information');
            sendLikesList(app, socket, io);
        }
    }

    function getPageID(app, socket, io, url) {
        console.log('URL: ', url);
        Browser.navigateUrl(io, url, true);
        app.routineState = 'getPageID';
    }

    function sendLikesList(app, socket, io) {

        let APIURL = `http://socialtrack.fan-factory.com/socialbots/confirm_actions/${app.userData.sidID}/1`;

        console.log('FbID: ', app.userData.sidID);
        console.log('Send Data Array: ############', idsArray);


        let idsArrayWithParameter = _.map(idsArray, (id: any) => {
            return {
                'parameter': id
            }
        });

        console.log('@idsArrayWithParameter: ', idsArrayWithParameter);

        request.post({
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            url: APIURL,
            body: "data=" + JSON.stringify(idsArrayWithParameter),
        }, (error: any, response: any, body: any) => {
            console.log("Server RESPONSE: ", body);
            if (error) {
                app.doRestart();
                console.log('error: ', error);
                console.log('body: ', body);
            }
            else {
                updateParsedLikes(app.userData._id).subscribe();
            }
        });

        setTimeout(() => {
            app.doRestart();
        }, 3000);
    }

    function setListeners(app, socket, io) {

        socket.on('getFBPageIDRes', (id) => {
            if (id && id !== null) {
                idsArray.push(id);
            }
            console.log('Curr: idsArray: ', idsArray);
            getIDs(app, socket, io);
        });

        socket.on('clickSaveRes', (pos) => {
            if (pos) {
                setTimeout(() => {

                    clickElement(pos, 1, app);

                    checkCurrentFacebookPage(app, socket, io);

                }, (T_TIME * 4));

            }
        });

        socket.on('enterProfileTextRes', (pos) => {

            if (pos) {
                clickElement(pos, 1, app);

                setTimeout(() => {
                    checkCurrentFacebookPage(app, socket, io);
                }, 3000);
            }


        });

        socket.on('skipPage', (pos) => {

            if (pos) {

                setTimeout(() => {

                    clickElement(pos, 1, app);

                    setTimeout(() => {
                        checkCurrentFacebookPage(app, socket, io);
                    }, (T_TIME * 3));

                }, (T_TIME * 4));


            }
            else {
                setTimeout(() => {
                    io.emit('getElementPos', {
                        response: 'skipPage',
                        text: 'Cancel',
                        type: 'a',
                    });
                }, 4000);
            }

        });

        socket.on('textExistsRes', (res) => {

            console.log('@checkUrlContainFriendsRes: ', res);

            setTimeout(() => {
                if (res.exists) {
                    clickLikesTab(app, socket, io);
                }
                else {
                    skipPage(app, socket, io);
                }
            }, 5000);


        });

        socket.on('clickAllLikeRes', (pos) => {
            if (pos) {

                pos.left = -150;
                pos.precise = true;
                clickElement(pos, 1, app);

                console.log('clickAllLikeRes ROS: ', pos);

                let time;
                if (likesUrlsCount === 0) {
                    time = 4000;
                }
                else {
                    time = 300;
                }
                setTimeout(() => {
                    parseLikes(app, socket, io);
                }, time);
            }
        });

        socket.on('clickLikesTabRes', (pos) => {
            if (pos) {
                console.log('clickLikesTabRes POS: ', pos);
                clickElement(pos, 1, app);

                setTimeout(() => {
                    clickAllLike(app, socket, io);
                }, 500);
            }
            else {

                console.log('No Like Button Scroll More...');
                scrollCount++;
                if (scrollCount > 12) {
                    console.log('@No likes tab do restart.');
                    scrollCount = 1;
                    updateParsedLikes(app.userData._id).subscribe();
                    app.doRestart();
                }
                clickLikesTab(app, socket, io);

            }
        });

        socket.on('parseLikesRes', (likesUrls) => {

            console.log('likesUrls: ', likesUrls);

            if (likesUrls) {

                urlsArray.push(likesUrls);
                likesUrlsCount++;
                parseLikes(app, socket, io);
            }
            else {

                console.log('@likesUrls.length: ', urlsArray.length);
                console.log('@likesUrlsCount: ', likesUrlsCount);

                getIDs(app, socket, io);

            }
        });


        socket.on('clickUpdateInfoRes', (pos) => {


            if (pos) {

                console.log('clickUpdateInfoRes POS: ', pos);

                clickElement(pos, 1, app);

                setTimeout(() => {
                    checkCurrentFacebookPage(app, socket, io);
                }, 5000);
            }


        });

        socket.on('clickNextRes', (pos) => {

            if (pos) {
                clickElement(pos, 1, app);

                setTimeout(() => {
                    clickUpdateInfo(app, socket, io);
                }, 2000);
            }
        });

        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
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

        socket.on('enterProfileRes', (pos) => {
            console.log('@enterProfile pos: ', pos);
            if (pos) {
                clickElement(pos, 1, app);
                clickUpdateInfo(app, socket, io);
            }
            else {
                console.log('@enterProfile pos bug: ', pos);
            }
        });
    }
}