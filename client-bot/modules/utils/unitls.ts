import * as fs from "fs";

export module Utils {

    export function randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    export function generateRandString(length: number): string {
        console.log('generateRandString');
        let pass = '';
        let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++)
            pass += possible.charAt(Math.floor(Math.random() * possible.length));
        return pass;
    }

    export let rmDir = function (dirPath, removeSelf) {
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
                    rmDir(filePath, false);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    };

    export function checkIfContains(locationHref, testString) {
        return locationHref.indexOf(testString) !== -1;
    }

    export function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

}