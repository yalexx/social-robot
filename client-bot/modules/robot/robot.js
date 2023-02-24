"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const robot = require("robotjs");
let _ = require('lodash');
let T_TIME = 1000;
let typeSpeed = 300;
let devices = {
    nexus7: {
        w: 960,
        h: 800
    }
};
let topOffset = 140;
let maxRight = currDevice().w;
let maxBottom = currDevice().h + topOffset;
function currDevice() {
    return devices.nexus7;
}
var Robot;
(function (Robot) {
    function typeText(text) {
        setTimeout(() => {
            robot.typeStringDelayed(text, typeSpeed);
        }, T_TIME);
    }
    Robot.typeText = typeText;
    function doScroll(scrollTime, callback) {
        let scrollLock = false;
        setTimeout(() => {
            scrollLock = true;
        }, (T_TIME * scrollTime));
        initScroll();
        function initScroll() {
            let pos = _.random(460, 560);
            let randTopBot = _.random(400, 430);
            let leftRight = _.random(820, 830);
            doSc(pos, randTopBot, leftRight);
        }
        function doSc(pos, randTopBot, leftRight) {
            let movePos = limitInsideDevice({
                left: leftRight,
                top: randTopBot
            });
            robot.mouseToggle("down");
            pos -= movePos.top;
            pos = limitInsideDevice({
                left: leftRight,
                top: pos
            }).top;
            robot.moveMouseSmooth(movePos.left, pos);
            setTimeout(function () {
                robot.mouseToggle("up");
                pos += movePos.top;
                pos = limitInsideDevice({
                    left: leftRight,
                    top: pos
                }).top;
                robot.moveMouseSmooth(movePos.left, pos);
                if (!scrollLock) {
                    initScroll();
                }
                else {
                    if (callback)
                        callback();
                }
            }, 200);
        }
    }
    Robot.doScroll = doScroll;
    function clickUploadPicture() {
        setTimeout(() => {
            console.log('@uploadPicture click');
            robot.moveMouse(500, 103);
            robot.mouseClick();
            robot.mouseClick();
        }, 1000);
    }
    Robot.clickUploadPicture = clickUploadPicture;
    function typeInputData(io, data, emailInputPosition, callback, app) {
        setTimeout(() => {
            clickElement(emailInputPosition, 1, app);
            setTimeout(() => {
                typeText(data);
                return callback();
            }, (T_TIME * 2));
        }, T_TIME);
    }
    Robot.typeInputData = typeInputData;
    function typeRobotEmail(io, data, pos, callback, app) {
        let emailArray = data.split('@');
        let emailName = emailArray[0];
        let emailProvider = emailArray[1];
        setTimeout(() => {
            clickElement(pos, 1, app);
            setTimeout(() => {
                typeText(emailName);
                setTimeout(() => {
                    robot.keyTap('2', ['shift']);
                    typeText(emailProvider);
                }, (T_TIME * 4));
                return callback();
            }, (T_TIME * 2));
        }, T_TIME);
    }
    Robot.typeRobotEmail = typeRobotEmail;
    function typeRobotEmailUser(io, data, pos, callback, app) {
        let emailArray = data.split('@');
        let emailName = emailArray[0];
        setTimeout(() => {
            clickElement(pos, 1, app);
            setTimeout(() => {
                typeText(emailName);
                return callback();
            }, (T_TIME * 2));
        }, T_TIME);
    }
    Robot.typeRobotEmailUser = typeRobotEmailUser;
    function typeRobotEmailName(io, data, pos, callback, appRef) {
        let emailArray = data.split('@');
        let emailName = emailArray[0];
        setTimeout(() => {
            clickElement(pos, 1, appRef);
            setTimeout(() => {
                typeText(emailName);
                return callback();
            }, T_TIME);
        }, T_TIME);
    }
    Robot.typeRobotEmailName = typeRobotEmailName;
    function moveMouse(pos, appRef) {
        let tOffset = topOffset;
        let randTop;
        let randLeft;
        if (pos.precise) {
            randTop = 2;
            randLeft = 2;
        }
        else {
            randTop = (_.random(150, 250) / 100);
            randLeft = (_.random(150, 250) / 100);
        }
        pos.top = (pos.top + (pos.height / randTop) + tOffset);
        pos.left = (pos.left + (pos.width / randLeft));
        pos = limitInsideDevice(pos);
        robot.moveMouseSmooth(pos.left, pos.top);
    }
    Robot.moveMouse = moveMouse;
    function limitInsideDevice(pos) {
        if (pos.top > maxBottom)
            pos.top = maxBottom;
        if (pos.top < topOffset)
            pos.top = topOffset;
        if (pos.left > maxRight)
            pos.left = maxRight;
        return pos;
    }
    function clickElement(elementInfo, count, appRef) {
        if (elementInfo == 'not_found' && elementInfo.top !== 0 && elementInfo.left !== 0 || elementInfo.width === 0 && elementInfo.height === 0)
            console.log('Element not found. ' + elementInfo);
        else {
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    moveMouse(elementInfo, appRef);
                    setTimeout(() => {
                        robot.mouseClick();
                    }, 300);
                }, 100);
            }
        }
    }
    Robot.clickElement = clickElement;
    function runActionListener(socket, appRef) {
        socket.on('server_msg_action_run', (elementInfo) => {
            if (elementInfo == 'not_found') {
                console.log('Element not found! ', elementInfo);
            }
            else {
                clickElement(elementInfo, 1, appRef);
            }
        });
    }
    Robot.runActionListener = runActionListener;
})(Robot = exports.Robot || (exports.Robot = {}));
