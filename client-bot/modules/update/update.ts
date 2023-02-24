let exec = require('child_process').exec;

export module Update {

    export function update(app) {
        console.log('@Git Pull');

        /*setTimeout(() => {
            exec("killall -KILL node");
        }, 2000);*/

        exec('git pull');
    }

}