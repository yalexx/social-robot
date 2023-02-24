"use strict";
exports.__esModule = true;
var browser_1 = require("./modules/browser/browser");
var register_facebook_1 = require("./routines/register-facebook");
var robot_1 = require("./modules/robot/robot");
var profile_photo_1 = require("./routines/profile-photo");
var storage_1 = require("./modules/storage/storage");
var cover_photo_1 = require("./routines/cover-photo");
var robot = require("robotjs");
var like_page_1 = require("./routines/like-page");
var initial_likes_1 = require("./routines/initial-likes");
var store_cookie_1 = require("./routines/store-cookie");
var search_friends_1 = require("./routines/search-friends");
var rx = require("rxjs");
var initial_shares_1 = require("./routines/initial-shares");
var suggested_friends_1 = require("./routines/suggested-friends");
var update_info_1 = require("./routines/update-info");
var parse_vk_1 = require("./routines/parse-vk");
var routine_types_1 = require("./modules/main/interface/routine-types");
var camp_types_1 = require("./routines/run-action/interface/camp-types");
var register_abv_1 = require("./routines/register-abv");
var server_connect_1 = require("./API/server-connect");
var getContainerData = server_connect_1.ServerAPI.getContainerData;
var updateContainerHost = server_connect_1.ServerAPI.updateContainerHost;
var register_web_de_1 = require("./routines/register-web-de");
var setScreenResolution = browser_1.Browser.setScreenResolution;
var validate_facebook_web_de_1 = require("./routines/validate-facebook-web-de");
var sendEvent = server_connect_1.ServerAPI.sendEvent;
var last_login_1 = require("./routines/last-login");
var like_manual_1 = require("./routines/like-manual");
var get_photos_1 = require("./routines/get-photos");
var post_photos_1 = require("./routines/post-photos");
var add_friends_1 = require("./routines/add-friends");
var start_shares_1 = require("./routines/start-shares");
var add_pages_1 = require("./routines/add-pages");
var control_1 = require("./routines/control");
var settings_1 = require("./routines/settings");
var invite_group_1 = require("./routines/invite-group");
var add_group_1 = require("./routines/add-group");
var rename_1 = require("./routines/rename");
var http = require('http').Server();
var io = require('socket.io')(http);
var port = 3000;
process.on('uncaughtException', function (error) {
    console.log('UncaughtException:', error.stack);
    app.doRestart();
});
process.setMaxListeners(0);
setScreenResolution();
require('events').EventEmitter.prototype._maxListeners = 0;
var MainApp = /** @class */ (function () {
    function MainApp() {
        var _this = this;
        this.defaultRoutine = 'rename';
        this.defaultAction = camp_types_1.CampType.fanpage_fans;
        this.refreshSubject = new rx.Subject();
        this.currentRoutine = process.argv.slice(2)[0] || this.defaultRoutine;
        this.currentAction = parseInt(process.argv.slice(3)[0]) || this.defaultAction;
        this.T_TIME = 1000;
        this.APIRes = null;
        this.routineState = 'init';
        this.loginState = 'init';
        this.initIO();
        storage_1.Storage.initStorage(this);
        console.log('Current Container is: ', process.env.CONTAINER);
        getContainerData(process.env.CONTAINER).subscribe(function (res) {
            console.log('@Container Data: ', res.data);
            if (res.data) {
                updateContainerHost(process.env.CONTAINER, process.env.HOSTNAME).subscribe(function (data) {
                    _this.currentRoutine = res.data.routine;
                    _this.containerData = res.data;
                    browser_1.Browser.spawn(_this.containerData);
                });
            }
            else {
                console.log('@Container Data not found. Wrong ID ? Fallback to Default Routine.');
                _this.currentRoutine = _this.defaultRoutine;
                browser_1.Browser.spawn();
            }
            console.log('Current routine: ', _this.currentRoutine);
        });
    }
    MainApp.prototype.initIO = function () {
        var _this = this;
        this.sessionStartTime = new Date();
        io.on('connection', function (socket) {
            console.log('@Connection');
            if (app.containerData) {
                io.emit('extensionSettings ', app.containerData.extensionSettings);
            }
            _this.refreshSubject.next({
                app: _this,
                socket: socket,
                io: io
            });
            console.log('Current Routine: ', _this.currentRoutine);
            /* API Routines */
            switch (_this.currentRoutine) {
                case routine_types_1.RoutineTypes.likePage:
                    like_page_1.LikePage.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.likeManual:
                    like_manual_1.LikeManual.init(app, socket, io);
                    break;
            }
            /* AUTO - Client Only Routines */
            switch (_this.currentRoutine) {
                case routine_types_1.RoutineTypes.control:
                    control_1.Control.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.RegisterWebDe:
                    register_web_de_1.RegisterWebDe.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.registerABV:
                    register_abv_1.RegisterABV.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.profilePhoto:
                    profile_photo_1.ProfilePhoto.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.coverPhoto:
                    cover_photo_1.CoverPhoto.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.registerFacebook:
                    register_facebook_1.RegisterFacebook.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.validateFacebookWebDe:
                    validate_facebook_web_de_1.ValidateFacebookWebDe.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.postsPhotos:
                    post_photos_1.PostPhotos.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.getPhotos:
                    get_photos_1.GetPhotos.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.storeCookie:
                    store_cookie_1.StoreCookie.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.lastLogin:
                    last_login_1.LastLogin.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.initialLikes:
                    initial_likes_1.InitialLikes.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.searchFriends:
                    search_friends_1.SearchFriends.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.addFriends:
                    add_friends_1.AddFriends.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.addPages:
                    add_pages_1.AddPages.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.initialShares:
                    initial_shares_1.InitialShares.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.startShares:
                    start_shares_1.StartShares.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.suggestedFriends:
                    suggested_friends_1.SuggestedFriends.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.updateInfo:
                    update_info_1.UpdateInfo.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.settings:
                    settings_1.Settings.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.inviteGroup:
                    invite_group_1.InviteGroup.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.addGroup:
                    add_group_1.AddGroup.init(app, socket, io);
                    break;
                case routine_types_1.RoutineTypes.rename:
                    rename_1.Rename.init(app, socket, io);
                    break;
            }
            /* Parse VK */
            switch (_this.currentRoutine) {
                case routine_types_1.RoutineTypes.parseVK:
                    parse_vk_1.ParseVK.init(app, socket, io);
                    break;
            }
            _this.setListeners(socket);
        });
    };
    MainApp.prototype.setListeners = function (socket) {
        var _this = this;
        robot_1.Robot.runActionListener(socket, this);
        socket.on('applyFacebookCookieDone', function (res) {
            if (res) {
                setTimeout(function () {
                    console.log('Cookie restored. Refresh.');
                    robot.keyTap('f5');
                }, 4000);
            }
        });
        socket.on('storeFacebookCookieRes', function (cookieData) {
            if (app.currentLocation.hostname === 'm.facebook.com' || app.currentLocation.hostname === 'www.facebook.com') {
                storage_1.Storage.updateSidCookie(app, cookieData).subscribe(function (res) {
                    if (app.currentRoutine === 'storeCookie') {
                        sendEvent(app, true).subscribe(function () {
                        });
                    }
                });
            }
        });
        socket.on('clickNext', function (pos) {
            if (pos) {
                robot_1.Robot.clickElement(pos, 1, _this);
            }
        });
        socket.on('currentLocation', function (res) {
            _this.currentLocation = res;
        });
        socket.on('browser_kill', function (res) {
            console.log('browser_kill');
            setTimeout(function () {
                app.routineState = 'idle';
                console.log('Stuck for 8 minutes Restart Browser.');
                app.doRestart();
            }, 4000);
        });
        socket.on('terminate_script', function (res) {
            console.log('ESC Press kill script.');
            process.exit(1);
        });
    };
    MainApp.prototype.doRestart = function () {
        app.routineState = 'init';
        app.loginState = 'init';
        if (app.refreshSubscription) {
            app.refreshSubscription.unsubscribe();
        }
        setTimeout(function () {
            browser_1.Browser.restart();
        }, 2000);
    };
    return MainApp;
}());
var app = new MainApp();
http.listen(port, function () {
    console.log('listening on *: ' + port);
});
