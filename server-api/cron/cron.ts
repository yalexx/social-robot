import schedule = require('node-schedule');
import {sendRemovedSids} from "../requests/sendRemovedSids";
import {ContainerModule} from "../modules/ContainerModule";
import {TaskModule} from '../modules/taskModule';
import dailyLimitReset = TaskModule.dailyLimitReset;

let request = require('request');
let exec = require('child_process').exec;

export function initCron() {

    // 7:00
    schedule.scheduleJob('00 00 06 * * *', () => {
        console.log('Dump DB');

        exec("mongodump -d social-robot-db -o ~/Dropbox/social-robot-db-backup");
        setTimeout(() => {
            console.log('@################# Daily Container Restart at 7.00 #################');
            ContainerModule.stopAllContainers();
        }, 10000);
        dailyLimitReset().subscribe();
    });

    // 12:00
    /*schedule.scheduleJob('00 00 12 * * *', () => {
        console.log('Cron on 12:00');
        setTimeout(() => {
            console.log('@################# Daily Container Restart at 12.00 #################');
            ContainerModule.stopAllContainers();
        }, 10000);
    });*/

    // 23:00
    /*schedule.scheduleJob('00 00 24 * * *', () => {
        setTimeout(() => {
            console.log('@################# Daily Container Restart at 14.00 #################');
            ContainerModule.stopAllContainers();
        }, 10000);
    });*/

}

