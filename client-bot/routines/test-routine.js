"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const browser_1 = require("../modules/browser/browser");
const storage_1 = require("../modules/storage/storage");
const robot_1 = require("../modules/robot/robot");
const timers_1 = require("timers");
let _ = require('lodash');
var TestRoutine;
(function (TestRoutine) {
    var clickElement = robot_1.Robot.clickElement;
    let data$ = storage_1.Storage.getRandomSidData({
        isVerified: true,
        haveProfilePhoto: true,
        isUsed: false,
    }), currentState = 'init', T_TIME = 700, testCount = 0, taskUrl = 'http://localhost:3001/';
    function checkState(app, socket, io) {
        console.log('@Current State: ', currentState);
        switch (currentState) {
            case 'init':
                data$.subscribe((data) => {
                    app.userData = data;
                    console.log('@SID: ', data);
                    currentState = 'navigateUrl';
                });
                break;
            case 'navigateUrl':
                timers_1.setTimeout(() => {
                    /*setLocation(app, socket, io);*/
                    timers_1.setTimeout(() => {
                        browser_1.Browser.navigateUrl(io, 'http://localhost:3001/');
                    }, 5000);
                    /*Browser.navigateUrl(io, taskUrl);*/
                    currentState = 'testEvent';
                }, (T_TIME * 10));
                break;
            case 'navigatePage':
                navigatePage(app, socket, io);
                break;
            case 'testEvent':
                clickFriendsList(app, socket, io);
                currentState = 'idle';
                break;
        }
    }
    TestRoutine.checkState = checkState;
    function init(app, socket, io) {
        setListeners(app, socket, io);
    }
    TestRoutine.init = init;
    function navigatePage(app, socket, io) {
        console.log('@scrollTimeline');
        browser_1.Browser.navigateUrl(io, taskUrl);
        currentState = 'testEvent';
    }
    TestRoutine.navigatePage = navigatePage;
    function clickFriendsList(app, socket, io) {
        timers_1.setTimeout(() => {
            io.emit('getInput', {
                response: 'clickInputRes',
                placeholder: 'Enter an employer',
            });
        }, (T_TIME * 10));
    }
    function setListeners(app, socket, io) {
        socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });
        socket.on('clickInputRes', (res) => {
            console.log('@RES: ', res);
            if (res) {
                clickElement(res, 1, app);
                console.log('element found');
            }
            else {
                console.log('element not found');
            }
        });
        /*socket.on('client_msg_connect', () => {
            checkState(app, socket, io);
        });*/
    }
})(TestRoutine = exports.TestRoutine || (exports.TestRoutine = {}));
