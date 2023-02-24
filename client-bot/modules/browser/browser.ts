import * as child_process from 'child_process';
import {setTimeout} from "timers";

let exec = require('child_process').exec;
let restarting = false;

let isWin = process.platform === "win32";
const CAN_RESTART = true;
const USE_VYPR_VPN = true;
let _ = require('lodash');

export module Browser {
    let ovpnProcess;
    let cData: any = {};

    export function spawn(containerData?: any): void {
        setTimeout(() => {
            console.log('Try to start the browser process');
            setTimeout(() => {
                child_process.spawn('opera', [
                    "--user-agent=\"Mozilla/5.0 (Linux; U; Android 2.2; en-gb; GT-P1000 Build/FROYO) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1\"",
                    '--allow-running-insecure-content',
                    '--start-maximized',
                    '--auto-open-devtools-for-tabs',
                    '--nosession',
                    '--no-sandbox',
                    '--window-size=1280,960'
                ]);

            }, 6000);
        }, 2000);
    }

    function resetIP() {
        if (USE_VYPR_VPN) {
            console.log('@terminal vyprvpn reset IP');

            exec('vyprvpn disconnect');
            setTimeout(() => {

                if (isWin) {
                    exec('taskkill /F /IM vyprvpn.exe');
                    exec('net.exe stop VyprVPN  && net.exe start VyprVPN');
                    setTimeout(() => {
                        child_process.spawn('C:\\Program Files (x86)\\VyprVPN\\VyprVPN.exe', []);
                    }, 3000);
                } else {
                    let serverID = _.random(1, 73);
                    console.log('Current VPN Server: ', serverID);
                    exec('printf "10" | vyprvpn server set');
                    setTimeout(() => {
                        exec('vyprvpn connect');
                    }, 500);
                }

            }, 500);
        }
    }

    export function setScreenResolution() {
        console.log('HOSTNAME:', process.env.HOSTNAME);
        if (process.env.HOSTNAME != '000000000000') {
            console.log('Set Screen Resolution xrandr: 1280x960');
            exec('xrandr --output VGA1 --rate 60 --fb 1280x960 --panning 1280x960 --primary');
        } else {
            console.log('Host Computer no xrandr');
        }
    }

    /*export function setProxyIP(app: any) {

        return Observable.create((observer: any) => {

            console.log('@Start OPENVPN Bulgaria.ovpn');

            exec('killall -HUP openvpn', {killSignal: 'SIGTERM'});
            exec('ip link delete tun0', {killSignal: 'SIGTERM'});

            setTimeout(() => {

                if (app.userData.country == 'de') {
                    country = 'Germany'
                }
                else if (app.userData.country == 'bg') {
                    country = 'Bulgaria'
                }

                ovpnProcess = exec(`cd OpenVPN256 && openvpn --config ${country}.ovpn`);

                ovpnProcess.stdout.on('data', (data: any) => {
                    console.log('stderr: ' + data);
                });

                ovpnProcess.stderr.on('data', (data: any) => {
                    console.log('stderr: ' + data);
                });

                ovpnProcess.on('close', (code: any) => {
                    console.log('closing code: ' + code);
                    exec('killall openvpn');
                    exec('ip link delete tun0');
                });

                setTimeout(() => {

                    getJSON('http://ip-api.com/json').subscribe((res: any) => {
                        console.log('ip-api res ', res);

                        console.log('Res Country: ', res.country);

                        console.log('app.userData.country ', app.userData.country);

                        if (res.isp === 'Cooolbox') {
                            console.log('Proxy Country Incorrect. Restart.');
                            observer.next(false);
                        }
                        else {
                            console.log('Proxy Country Correct.');
                            observer.next(true);
                            observer.complete();
                        }
                    });

                }, 8000);


            }, 300);
        });
    }*/

    export function kill(): void {
        if (process.env.HOSTNAME != '000000000000') {
            resetIP();
        }
        setTimeout(() => {
            if (isWin) {
                exec('rem Kill all chrome process');
                exec('taskkill /F /IM chrome.exe');

            } else {
                exec("killall -KILL opera");
            }
        }, 8000);
        console.log('isWin: ', isWin);
    }

    export function restart(): void {

        if (!restarting && CAN_RESTART) {

            console.log('@BROWSER RESTART !!!! restart time : ');
            kill();
            restarting = true;
            setTimeout(() => {
                console.log('Browser Spawn.');
                Browser.spawn(cData);
                restarting = false;
            }, 15000);
        }
    }

    export function goBack(io: any): void {
        io.emit('goBack');
    }

    export function getDomElementPosition(io: any, elementSelector: any): void {
        io.emit('client_msg_element_info_position', elementSelector);
    }

    export function navigateUrl(io: any, url: any, notPrivate?: any): void {
        io.emit('navigateUrl', url);
    }
}