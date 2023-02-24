"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const timers_1 = require("timers");
let exec = require('child_process').exec;
let restarting = false;
let isWin = process.platform === "win32";
const CAN_RESTART = true;
const USE_VYPR_VPN = true;
let _ = require('lodash');
var Browser;
(function (Browser) {
    let ovpnProcess;
    let cData = {};
    function spawn(containerData) {
        timers_1.setTimeout(() => {
            console.log('Try to start the browser process');
            timers_1.setTimeout(() => {
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
    Browser.spawn = spawn;
    function resetIP() {
        if (USE_VYPR_VPN) {
            console.log('@terminal vyprvpn reset IP');
            exec('vyprvpn disconnect');
            timers_1.setTimeout(() => {
                if (isWin) {
                    exec('taskkill /F /IM vyprvpn.exe');
                    exec('net.exe stop VyprVPN  && net.exe start VyprVPN');
                    timers_1.setTimeout(() => {
                        child_process.spawn('C:\\Program Files (x86)\\VyprVPN\\VyprVPN.exe', []);
                    }, 3000);
                }
                else {
                    let serverID = _.random(1, 73);
                    console.log('Current VPN Server: ', serverID);
                    exec('printf "10" | vyprvpn server set');
                    timers_1.setTimeout(() => {
                        exec('vyprvpn connect');
                    }, 500);
                }
            }, 500);
        }
    }
    function setScreenResolution() {
        console.log('HOSTNAME:', process.env.HOSTNAME);
        if (process.env.HOSTNAME != '000000000000') {
            console.log('Set Screen Resolution xrandr: 1280x960');
            exec('xrandr --output VGA1 --rate 60 --fb 1280x960 --panning 1280x960 --primary');
        }
        else {
            console.log('Host Computer no xrandr');
        }
    }
    Browser.setScreenResolution = setScreenResolution;
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
    function kill() {
        if (process.env.HOSTNAME != '000000000000') {
            resetIP();
        }
        timers_1.setTimeout(() => {
            if (isWin) {
                exec('rem Kill all chrome process');
                exec('taskkill /F /IM chrome.exe');
            }
            else {
                exec("killall -KILL opera");
            }
        }, 8000);
        console.log('isWin: ', isWin);
    }
    Browser.kill = kill;
    function restart() {
        if (!restarting && CAN_RESTART) {
            console.log('@BROWSER RESTART !!!! restart time : ');
            kill();
            restarting = true;
            timers_1.setTimeout(() => {
                console.log('Browser Spawn.');
                Browser.spawn(cData);
                restarting = false;
            }, 15000);
        }
    }
    Browser.restart = restart;
    function goBack(io) {
        io.emit('goBack');
    }
    Browser.goBack = goBack;
    function getDomElementPosition(io, elementSelector) {
        io.emit('client_msg_element_info_position', elementSelector);
    }
    Browser.getDomElementPosition = getDomElementPosition;
    function navigateUrl(io, url, notPrivate) {
        io.emit('navigateUrl', url);
    }
    Browser.navigateUrl = navigateUrl;
})(Browser = exports.Browser || (exports.Browser = {}));
