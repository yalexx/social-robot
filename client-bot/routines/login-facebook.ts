import {Browser} from "../modules/browser/browser";
import {Storage} from "../modules/storage/storage";
import {Robot} from "../modules/robot/robot";
import {setTimeout} from "timers";
import {Observable} from 'rxjs/Observable';

export module LoginFacebook {

    import getDomElementPosition = Browser.getDomElementPosition;
    import clickElement = Robot.clickElement;
    import removeSid = Storage.removeSid;

    let T_TIME = 1200;
    let loginUrl = 'http://facebook.com/login';

    export function login$(app, socket, io): Observable<any> {


        return Observable.create(observer => {


            app.refreshSubscription = app.refreshSubject.subscribe((data) => {
                console.log('@refreshSubscription trigger');
                checkState(data.app, data.socket, data.io);
                setListeners(data.app, data.socket, data.io);
            });

            checkState(app, socket, io);

            function checkState(app, socket, io) {

                console.log('@Current State from Login1: ', app.loginState);


                switch (app.loginState) {
                    case 'init':
                        app.loginState = 'navigateUrl';
                        checkState(app, socket, io);
                        break;
                    case 'navigateUrl':
                        console.log('@User Data registerEmail: ', app.userData.registerEmail);
                        setTimeout(() => {
                            Browser.navigateUrl(io, loginUrl);
                            app.loginState = 'doLogin';
                        }, (T_TIME * 10));
                        app.loginState = 'idle';
                        break;
                    case 'doLogin':
                        setTimeout(() => {
                            if (app.userData.cookie) {
                                console.log('@We have cookie. Apply');
                                applyFacebookCookie(app, socket, io);
                            }
                        }, (T_TIME * 15));
                        app.loginState = 'idle';
                        break;
                    case 'clickOneTabOk':
                        setTimeout(() => {
                            clickOneTabOk(app, socket, io);
                        }, T_TIME);
                        app.loginState = 'idle';
                        break;
                    case 'checkLoginSuccess':
                        setTimeout(() => {
                            checkLoginSuccess(app, socket, io);
                        }, (T_TIME * 30));
                        app.loginState = 'idle';
                        break;
                    case 'idle':
                        console.log('@Login idle.');
                        break;
                }
            }

            function typeFacebookEmail(app, socket, io) {

                console.log('typeFacebookEmail');

                setTimeout(() => {
                    io.emit('setValue', {
                        selector: ['#m_login_email', '#email'],
                        response: 'clickBtn',
                        val: app.userData.registerEmail
                    });
                    enterPassAndLogIn(app, socket, io);

                }, 3000);
            }

            function enterPassAndLogIn(app, socket, io) {

                setTimeout(() => {

                    console.log('typeFacebookPasswordRes');
                    io.emit('setValue', {
                        selector: ['input[type="password"]', '#m_login_password', '#pass'],
                        response: 'typeFacebookPasswordRes',
                        val: app.userData.registerPassword
                    });

                    setTimeout(() => {

                        console.log('clickFacebookLoginButtonRes');

                        io.emit('click', {
                            selector: ['button:first', '#loginbutton'],
                            response: 'clickFacebookLoginButtonRes',
                        });

                        setTimeout(() => {
                            app.loginState = 'checkLoginSuccess';
                            checkState(app, socket, io);
                        }, 10000);

                    }, 1000);

                }, 2000);
            }

            function clickLoginProfile(app, socket, io) {

                console.log('inside clickLoginProfile');
                // click your profile to open the password field

                io.emit('getElementPos', {
                    response: 'clickBtn',
                    selector: '.profpic',
                });

                setTimeout(() => {
                    console.log('enterPassAndLogIn');
                    enterPassAndLogIn(app, socket, io);
                }, 20000);

            }

            function checkUnusualActivity(app, socket, io) {

                io.emit('textExists', {
                    response: 'doLoginRestart',
                    text: 'Invalid username',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'doLoginRestart',
                    text: 'The email or phone number you',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'Enter Mobile Number',
                    text: 'The email or phone number you',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'The password you entered is incorrect',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Incorrect password',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'doLoginRestart',
                    text: 'The email or phone number you’ve entered doesn’t match any account.',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'We want to make',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'You used an old password',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Enter Mobile Number',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Your Account Has Been Disabled',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Upload A Photo Of Yourself',
                    type: 'div'
                });


                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Security Check',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Your account has been disabled.',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Use a phone to verify your account',
                    type: 'div'
                });

                io.emit('textExists', {
                    response: 'checkUnusualActivity',
                    text: 'Help Us Confirm',
                    type: 'div'
                });

                io.emit('getActionBtnPos', {
                    type: 'a',
                    text: 'English (US)',
                    response: 'clickBtnRes',
                });


            }

            function checkGender(app, socket, io) {

                io.emit('textExists', {
                    response: 'checkGender',
                    text: 'Providing your gender',
                    type: 'div'
                });

            }

            function checkLoginEmailExist(app, socket, io) {

                io.emit('textExists', {
                    response: 'checkLoginEmailExist',
                    text: 'The email you’ve entered',
                    type: 'div'
                });

            }

            function clickOneTabOk(app, socket, io) {

                getDomElementPosition(io, {
                    response: 'clickOneTabOk',
                    class: '_2pis',
                    position: "0",
                    type: 'button',
                    child_position: 0
                });

                getDomElementPosition(io, {
                    response: 'clickOneTabOk',
                    text: 'Ok',
                    type: 'span'
                });
            }

            function checkLoginSuccess(app, socket, io) {

                console.log('##### Current location pathname: ', app.currentLocation.pathname);

                if (app.currentLocation) {


                    let weAreOnFb = app.currentLocation.host === 'm.facebook.com' || app.currentLocation.host === "www.facebook.com";

                    console.log('weAreOnFb: ', weAreOnFb);

                    if (weAreOnFb) {

                        if (app.currentLocation.pathname === '/home.php' || app.currentLocation.pathname === '/' || app.currentLocation.pathname === '' ||
                            app.currentLocation.pathname === '/login/save-device/' || app.currentLocation.pathname === '/qp/interstitial/') {
                            afterLogin(app, socket, io);
                        } else {

                            if (app.currentLocation.pathname === '/gettingstarted/') {

                                clickNext(app, socket, io);
                                app.loginState = 'clickOneTabOk';

                                setTimeout(() => {
                                    console.log('gin again in T20');
                                    checkLoginSuccess(app, socket, io);
                                }, (T_TIME * 24));

                            } else if (app.currentLocation.pathname === '/confirmemail.php' || app.currentLocation.pathname === '/checkpoint/block/') {

                                console.log('@SID Blocked, remove sid.');
                                removeSid(app.userData).subscribe();
                                observer.next(false);

                            } else if (app.currentLocation.pathname === '/invite/history/') {

                                observer.next(false);

                            } else if (app.currentLocation.pathname === '/checkpoint/') {

                                console.log('@Enter the characters');

                                io.emit('textExists', {
                                    response: 'enterCodeRes',
                                    text: 'code',
                                    type: 'div'
                                });

                                io.emit('textExists', {
                                    response: 'checkUnusualActivity',
                                    text: 'Your Account Has Been Disabled',
                                    type: 'div'
                                });

                            } else if (app.currentLocation.pathname === '/gdpr/consent/') {

                                console.log('gdpr !!!');

                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'Get Started',
                                    response: 'gdprGetStartedBtnRes',
                                });

                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'Review Now',
                                    response: 'gdprGetStartedBtnRes',
                                });

                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'Confirm',
                                    response: 'gdprGetStartedBtnRes',
                                });

                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'Return to News Feed',
                                    response: 'gdprGetStartedBtnRes',
                                });

                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'I Accept',
                                    response: 'gdprGetStartedBtnRes',
                                });


                            } else {
                                console.log('@current page is not fb login page, just restart');
                                observer.next(false);
                            }
                        }

                    }
                } else {
                    app.doRestart();
                    observer.next(false);
                }


                app.loginState = 'idle';
            }

            function clickNext(app, socket, io) {

                setTimeout(() => {

                    io.emit('getElementPos', {
                        response: 'clickNext',
                        text: 'Next',
                        selector: 'a',
                    });

                    io.emit('getElementPos', {
                        response: 'clickNext',
                        text: 'Next',
                        selector: 'a',
                    });

                    setTimeout(() => {

                        io.emit('getElementPos', {
                            response: 'clickNext',
                            text: 'Next',
                            selector: 'a',
                        });

                        setTimeout(() => {

                            io.emit('getElementPos', {
                                response: 'clickNext',
                                text: 'Next',
                                selector: 'a',
                            });

                        }, (T_TIME * 6));

                    }, (T_TIME * 6));

                }, (T_TIME * 6));


            }

            function afterLogin(app, socket, io) {
                setTimeout(() => {
                    observer.next(true);
                }, (T_TIME * 15));

                setTimeout(() => {

                    closeAppPopup(app, socket, io);

                    setTimeout(() => {
                        storeFacebookCookie(app, socket, io);
                    }, (T_TIME * 6));

                }, T_TIME);


            }

            function applyFacebookCookie(app, socket, io) {

                setTimeout(() => {
                    console.log('@start applyFacebookCookie');

                    io.emit('applyFacebookCookie', {
                        data: JSON.parse(app.userData.cookie),
                        response: 'applyFacebookCookieDone'
                    });

                    setTimeout(() => {
                        console.log('check if text exists: ', 'Tap to Log In');
                        io.emit('textExists', {
                            response: 'tabLoginRes',
                            text: 'Tap to Log In',
                            type: 'p'
                        });
                    }, 26000);


                }, (T_TIME * 5));
            }

            function storeFacebookCookie(app, socket, io) {
                io.emit('getFacebookCookie', {
                    response: 'storeFacebookCookieRes'
                });
            }

            function closeAppPopup(app, socket, io) {

                setTimeout(() => {

                    io.emit('hideElement', {
                        selector: '#header-notices',
                    });

                }, (T_TIME * 5));
            }

            function setListeners(app, socket, io) {

                /*GDRP*/
                socket.on('gdprGetStartedBtnRes', (pos) => {
                    console.log('Start GDP gdprGetStartedBtnRes');
                    if (pos && pos.width !== 0) {

                        clickElement(pos, 1, app);

                        io.emit('getActionBtnPos', {
                            type: 'span',
                            text: 'Confirm',
                            response: 'gdprGetAcceptRes',
                        });

                        setTimeout(() => {

                            io.emit('getActionBtnPos', {
                                type: 'span',
                                text: 'Accept and Continue',
                                response: 'gdprGetAcceptRes',
                            });

                            setTimeout(() => {
                                io.emit('getActionBtnPos', {
                                    type: 'span',
                                    text: 'Accept and Continue',
                                    response: 'gdprGetAcceptRes',
                                });

                                setTimeout(() => {
                                    io.emit('getActionBtnPos', {
                                        type: 'span',
                                        text: 'I Accept',
                                        response: 'gdprGetAcceptRes',
                                    });

                                    io.emit('getActionBtnPos', {
                                        type: 'span',
                                        text: 'Return to News Feed',
                                        response: 'gdprGetStartedBtnRes',
                                    });

                                    setTimeout(() => {
                                        io.emit('getActionBtnPos', {
                                            type: 'span',
                                            text: 'Return to News Feed',
                                            response: 'gdprGetAcceptRes',
                                        });
                                        setTimeout(() => {
                                            checkLoginSuccess(app, socket, io);
                                        }, 15000);
                                    }, 5000);
                                }, 5000);
                            }, 5000);
                        }, 5000);
                    }
                });

                socket.on('gdprGetAcceptRes', (pos) => {
                    if (pos && pos.width !== 0) {
                        clickElement(pos, 1, app);
                    }
                });

                socket.on('clickContinueRes', (pos) => {
                    if (pos) {
                        clickElement(pos, 1, app);
                        checkLoginSuccess(app, socket, io);
                    }
                });

                /*socket.on('typeFacebookPasswordRes', (elementExists) => {
                    if (!elementExists) {
                        observer.next(false);
                    }
                });*/

                socket.on('checkUnusualActivity', (res) => {

                    if (res.exists) {
                        console.log('@Unusual Activity error, remove sid: ', res.exists);
                        removeSid(app.userData).subscribe(() => {
                        });
                        observer.next(false);
                    }
                });

                socket.on('doLoginRestart', (res) => {
                    if (res.exists) {
                        console.log('@Login error restart: ', res.exists);
                        app.loginState = 'idle';
                        observer.next(false);
                    }
                });

                socket.on('tabLoginRes', (res) => {
                    socket.removeAllListeners("tabLoginRes");
                    console.log('tabLoginRes: ', res);

                    if (app.currentLocation.pathname == '/home.php') {
                        observer.next(true);
                    } else {
                        if (res.exists) {
                            // first click on profile then enter pass
                            clickLoginProfile(app, socket, io);
                        } else {
                            // normal login
                            typeFacebookEmail(app, socket, io);
                        }

                    }
                });


                socket.on('checkLoginEmailExist', (res) => {

                    console.log('@Email error, remove sid: ', res.exists);
                    if (res.exists) {
                        console.log('@not validated');
                        removeSid(app.userData).subscribe(() => {
                        });
                        observer.next(false);
                    }
                });

                socket.on('clickOneTabOk', (pos) => {
                    if (pos) {
                        clickElement(pos, 1, app);
                        getDomElementPosition(io, {
                            response: 'clickBtn',
                            text: 'OK',
                            type: 'span'
                        });
                    }
                });

                socket.on('clickBtnRes', (pos) => {
                    if (pos) {
                        clickElement(pos, 1, app);
                        checkLoginSuccess(app, socket, io);
                    }
                });

                socket.on('closeAppPopupRes', (pos) => {

                    console.log('Close popup !!!');

                    if (pos) {
                        clickElement(pos, 1, app);
                        setTimeout(() => io.emit('scrollTop'), 2000);
                    }
                });

                socket.on('clickBtn', (pos) => {
                    if (pos) {
                        console.log('clickBtn: ', pos);
                        clickElement(pos, 1, app);
                    }
                });


                socket.on('clickFacebookLoginButtonRes', (elementExists) => {

                    if (elementExists) {
                        app.loginState = 'checkLoginSuccess';
                        setTimeout(() => {
                            setTimeout(() => {
                                checkLoginEmailExist(app, socket, io);
                            }, T_TIME);

                            setTimeout(() => {
                                checkUnusualActivity(app, socket, io);
                            }, (T_TIME * 3));

                            setTimeout(() => {
                                checkGender(app, socket, io);
                                /*clickOneTabOk(app, socket, io);*/
                            }, (T_TIME * 6));
                        }, (T_TIME * 8));
                    }
                });
            }
        });
    }
}

