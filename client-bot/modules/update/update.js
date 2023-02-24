"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let exec = require('child_process').exec;
var Update;
(function (Update) {
    function update(app) {
        console.log('@Git Pull');
        /*setTimeout(() => {
            exec("killall -KILL node");
        }, 2000);*/
        exec('git pull');
    }
    Update.update = update;
})(Update = exports.Update || (exports.Update = {}));
