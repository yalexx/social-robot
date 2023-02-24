"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/map");
// anti-captcha.com account key
let APIkey = '1d241a41a736a0787666f78ec5b976f9';
let anticaptcha = require('./anticaptcha')(APIkey);
var Anticaptcha;
(function (Anticaptcha) {
    function solveImage(dataURI) {
        return Observable_1.Observable.create(observer => {
            anticaptcha.getBalance((err, balance) => {
                if (err) {
                    observer.error(err);
                    return;
                }
                // captcha params can be set here
                anticaptcha.setMinLength(5);
                console.log('Send Captcha for solving.');
                if (balance > 0) {
                    anticaptcha.createImageToTextTask({
                        case: true,
                        body: dataURI
                    }, function (err, taskId) {
                        if (err) {
                            observer.error(err);
                            return;
                        }
                        anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
                            if (err) {
                                observer.error(err);
                                return;
                            }
                            observer.next(taskSolution);
                            observer.complete();
                        });
                    });
                }
            });
        });
    }
    Anticaptcha.solveImage = solveImage;
})(Anticaptcha = exports.Anticaptcha || (exports.Anticaptcha = {}));
