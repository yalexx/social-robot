"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
var Utils;
(function (Utils) {
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    Utils.randomIntFromInterval = randomIntFromInterval;
    function generateRandString(length) {
        console.log('generateRandString');
        let pass = '';
        let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++)
            pass += possible.charAt(Math.floor(Math.random() * possible.length));
        return pass;
    }
    Utils.generateRandString = generateRandString;
    Utils.rmDir = function (dirPath, removeSelf) {
        if (removeSelf === undefined)
            removeSelf = true;
        try {
            var files = fs.readdirSync(dirPath);
        }
        catch (e) {
            return;
        }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    Utils.rmDir(filePath, false);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    };
    function checkIfContains(locationHref, testString) {
        return locationHref.indexOf(testString) !== -1;
    }
    Utils.checkIfContains = checkIfContains;
    function IsJsonString(str) {
        try {
            JSON.parse(str);
        }
        catch (e) {
            return false;
        }
        return true;
    }
    Utils.IsJsonString = IsJsonString;
})(Utils = exports.Utils || (exports.Utils = {}));
