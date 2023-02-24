import {Browser} from "./modules/browser/browser";
import {RegisterFacebook} from "./routines/register-facebook";
import {Robot} from "./modules/robot/robot";
import {ProfilePhoto} from "./routines/profile-photo";
import {Storage} from "./modules/storage/storage";
import {CoverPhoto} from "./routines/cover-photo";
import * as robot from 'robotjs';
import {LikePage} from "./routines/like-page";
import {InitialLikes} from "./routines/initial-likes";
import {StoreCookie} from "./routines/store-cookie";
import {SearchFriends} from "./routines/search-friends";
import {TestRoutine} from "./routines/test-routine";
import * as rx from 'rxjs';
import {Subscription} from "rxjs/Subscription";
import {InitialShares} from "./routines/initial-shares";
import {RegisterSocialbot} from "./routines/register-social-bot";
import {VerifySid} from "./routines/verify-sid";
import {SuggestedFriends} from "./routines/suggested-friends";
import {UpdateInfo} from "./routines/update-info";
import {ParseVK} from "./routines/parse-vk";
import {RunAction} from "./routines/run-action/run-action";
import {RoutineTypes} from "./modules/main/interface/routine-types";
import {ParseSidLikes} from "./routines/parse-sid-likes/parse-sid-likes";
import {CampType} from "./routines/run-action/interface/camp-types";
import {RegisterABV} from "./routines/register-abv";
import {ServerAPI} from "./API/server-connect";
import getContainerData = ServerAPI.getContainerData;
import updateContainerHost = ServerAPI.updateContainerHost;
import {RegisterWebDe} from "./routines/register-web-de";
import setScreenResolution = Browser.setScreenResolution;
import {ValidateFacebookWebDe} from "./routines/validate-facebook-web-de";
import sendEvent = ServerAPI.sendEvent;
import {LastLogin} from './routines/last-login';
import {StoreAction} from './routines/run-action/store-action';
import {LikeManual} from './routines/like-manual';
import {RegisterDir} from './routines/register-dir';
import {GetPhotos} from './routines/get-photos';
import {PostPhotos} from './routines/post-photos';
import {AddFriends} from './routines/add-friends';
import {ValidateFacebookDir} from './routines/validate-facebook-dir';
import {StartShares} from './routines/start-shares';
import {AddPages} from './routines/add-pages';
import {Control} from "./routines/control";
import {Settings} from "./routines/settings";
import {InviteGroup} from "./routines/invite-group";
import {Addmefast} from "./routines/addmefast";
import {AddGroup} from "./routines/add-group";
import {LikeGame} from "./routines/like-game";
import {Rename} from "./routines/rename";

const http = require('http').Server();
const io = require('socket.io')(http);

const port = 3000;
process.on('uncaughtException', (error) => {
    console.log('UncaughtException:', error.stack);
    app.doRestart();
});


process.setMaxListeners(0);
setScreenResolution();
require('events').EventEmitter.prototype._maxListeners = 0;

class MainApp {
    defaultRoutine: string = 'rename';
    defaultAction: number = CampType.fanpage_fans;
    sessionStartTime: Date;
    userData;
    VKSIDData;
    refreshSubject = new rx.Subject();
    currentLocation: any;
    currentRoutine: string = process.argv.slice(2)[0] || this.defaultRoutine;
    containerData;
    currentAction: number = parseInt(process.argv.slice(3)[0]) || this.defaultAction;
    data$;
    T_TIME = 1000;
    url: string;
    facebookID;
    APIRes = null;
    refreshSubscription: Subscription;
    socket;
    io;
    routineState = 'init';
    loginState = 'init';

    constructor() {
        this.initIO();
        Storage.initStorage(this);

        console.log('Current Container is: ', process.env.CONTAINER);

        getContainerData(process.env.CONTAINER).subscribe((res) => {
            console.log('@Container Data: ', res.data);

            if (res.data) {
                updateContainerHost(process.env.CONTAINER, process.env.HOSTNAME).subscribe((data) => {
                    this.currentRoutine = res.data.routine;
                    this.containerData = res.data;
                    Browser.spawn(this.containerData);
                });

            } else {
                console.log('@Container Data not found. Wrong ID ? Fallback to Default Routine.');
                this.currentRoutine = this.defaultRoutine;
                Browser.spawn();
            }
            console.log('Current routine: ', this.currentRoutine);
        });
    }

    initIO() {
        this.sessionStartTime = new Date();

        io.on('connection', (socket) => {

            console.log('@Connection');
            if (app.containerData) {
                io.emit('extensionSettings ', app.containerData.extensionSettings);
            }

            this.refreshSubject.next({
                app: this,
                socket: socket,
                io: io
            });

            console.log('Current Routine: ', this.currentRoutine);

            /* API Routines */
            switch (this.currentRoutine) {
                case RoutineTypes.likePage:
                    LikePage.init(app, socket, io);
                    break;
                case RoutineTypes.likeManual:
                    LikeManual.init(app, socket, io);
                    break;
            }

            /* AUTO - Client Only Routines */
            switch (this.currentRoutine) {
                case RoutineTypes.control:
                    Control.init(app, socket, io);
                    break;
                case RoutineTypes.RegisterWebDe:
                    RegisterWebDe.init(app, socket, io);
                    break;
                case RoutineTypes.registerABV:
                    RegisterABV.init(app, socket, io);
                    break;
                case RoutineTypes.profilePhoto:
                    ProfilePhoto.init(app, socket, io);
                    break;
                case RoutineTypes.coverPhoto:
                    CoverPhoto.init(app, socket, io);
                    break;
                case RoutineTypes.registerFacebook:
                    RegisterFacebook.init(app, socket, io);
                    break;
                case RoutineTypes.validateFacebookWebDe:
                    ValidateFacebookWebDe.init(app, socket, io);
                    break;
                case RoutineTypes.postsPhotos:
                    PostPhotos.init(app, socket, io);
                    break;
                case RoutineTypes.getPhotos:
                    GetPhotos.init(app, socket, io);
                    break;
                case RoutineTypes.storeCookie:
                    StoreCookie.init(app, socket, io);
                    break;
                case RoutineTypes.lastLogin:
                    LastLogin.init(app, socket, io);
                    break;
                case RoutineTypes.initialLikes:
                    InitialLikes.init(app, socket, io);
                    break;
                case RoutineTypes.searchFriends:
                    SearchFriends.init(app, socket, io);
                    break;
                case RoutineTypes.addFriends:
                    AddFriends.init(app, socket, io);
                    break;
                case RoutineTypes.addPages:
                    AddPages.init(app, socket, io);
                    break;
                case RoutineTypes.initialShares:
                    InitialShares.init(app, socket, io);
                    break;
                case RoutineTypes.startShares:
                    StartShares.init(app, socket, io);
                    break;
                case RoutineTypes.suggestedFriends:
                    SuggestedFriends.init(app, socket, io);
                    break;
                case RoutineTypes.updateInfo:
                    UpdateInfo.init(app, socket, io);
                    break;
                case RoutineTypes.settings:
                    Settings.init(app, socket, io);
                    break;
                case RoutineTypes.inviteGroup:
                    InviteGroup.init(app, socket, io);
                    break;
                case RoutineTypes.addGroup:
                    AddGroup.init(app, socket, io);
                    break;
                case RoutineTypes.rename:
                    Rename.init(app, socket, io);
                    break;
            }

            /* Parse VK */
            switch (this.currentRoutine) {
                case RoutineTypes.parseVK:
                    ParseVK.init(app, socket, io);
                    break;
            }

            this.setListeners(socket);
        });
    }

    setListeners(socket) {

        Robot.runActionListener(socket, this);
        socket.on('applyFacebookCookieDone', (res) => {
            if (res) {
                setTimeout(() => {
                    console.log('Cookie restored. Refresh.');
                    robot.keyTap('f5');
                }, 4000);
            }
        });

        socket.on('storeFacebookCookieRes', (cookieData) => {
            if (app.currentLocation.hostname === 'm.facebook.com' || app.currentLocation.hostname === 'www.facebook.com') {
                Storage.updateSidCookie(app, cookieData).subscribe((res) => {
                    if (app.currentRoutine === 'storeCookie') {
                        sendEvent(app, true).subscribe(() => {
                        });
                    }
                });
            }
        });

        socket.on('clickNext', (pos) => {
            if (pos) {
                Robot.clickElement(pos, 1, this);
            }
        });

        socket.on('currentLocation', (res) => {
            this.currentLocation = res;
        });

        socket.on('browser_kill', (res) => {
            console.log('browser_kill');
            setTimeout(() => {
                app.routineState = 'idle';
                console.log('Stuck for 8 minutes Restart Browser.');
                app.doRestart();
            }, 4000);
        });

        socket.on('terminate_script', (res) => {
            console.log('ESC Press kill script.');
            process.exit(1);
        });
    }

    doRestart() {
        app.routineState = 'init';
        app.loginState = 'init';
        if (app.refreshSubscription) {
            app.refreshSubscription.unsubscribe();
        }
        setTimeout(() => {
            Browser.restart();
        }, 2000);

    }
}

let app = new MainApp();

http.listen(port, () => {
    console.log('listening on *: ' + port);
});