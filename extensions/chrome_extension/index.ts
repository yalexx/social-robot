// TODO Use browserify to load the compiled modules in the client. browserify main.js -o bundle.js

/*In the preceding command, main.js is the file that contains the root module within our application's dependency tree.
 The bundle.js file is the output file that we will be able to import using a HTML script tag.
 Import the bundle.js file using a HTML <script> tag.*/
let parseFriendsCount = 0;
let port_number = 3000;
let extensionSettings = {
    BrowserStuckTimeout: 480000,
    BrowserStuckNoRestart: false,
};
let socket = io('http://localhost:' + port_number, {
    'reconnection': true,
    'reconnectionDelay': 600,
    'reconnectionAttempts': 30
});


setListeners();
setEmitters();

function isMobile() {
    if (navigator.userAgent.match(/Android/i)) {
        return 0;
    } else {
        return 1;
    }
};

socket.on('extensionSettings', (settings) => {
    if (settings) {
        console.log('settings: ', settings);
        extensionSettings = settings;
        emitBrowserStuck(socket);
    }
});

socket.emit('currentLocation', window.location);
IPData();

function IPData() {
    if (window.location.href === 'http://ip-api.com/json') {
        let data = $('body pre').text();
        console.log('IPData: ', data);
        socket.emit('IPData', JSON.parse(data));
    }
}

function setListeners() {

    socket.on('nodeLog', (log) => {
        console.info('NODE: ', log);
    });

    socket.on('resetBrowserStuckTimeout', () => {
        resetBrowserStuckTimeout();
    });


    $.fn.nthParent = function (n) {
        var p = this;
        for (var i = 0; i < n; i++)
            p = p.parent();
        return p;
    }

    socket.on('removeElement', (msg) => {
        if (msg.parent) {
            $(msg.selector).nthParent(msg.parent).remove();
        } else {
            $(msg.selector).remove();
        }
    });


    socket.on('clickLoveBtn', (msg) => {
        console.log('clickLoveBtn');

        $('._544l._1-kb.accelerate').css("display", "block");
        console.log($('._544l._1-kb.accelerate'));

        setTimeout(() => {
            $("div[aria-label='Love']").trigger('click');
            console.log($("div[aria-label='Love']"));
        }, 500);

    });

    socket.on('hideElement', (msg) => {
        console.log('Hide Element: ', msg.selector);
        $(msg.selector).hide();
    });


    socket.on('goBack', () => {
        console.log('Go Back.');
        window.history.back();
    });

    socket.on('scrollTop', () => $('html, body').animate({
        scrollTop: 0
    }, 30));

    socket.on('server_inject', function (code_inject) {
        console.log('server_inject code.');
        eval(code_inject);
    });

    socket.on('navigateUrl', function (url) {
        window.location.replace(url);
        console.log('Navigate url: ', url);

    });

    socket.on('remove_text', function (msg) {
        let selector = $($('#' + msg.id)[0]);
        console.log('@text removed.', selector);
        selector.val('');
    });

    socket.on('checkUrlContainText', (msg) => {
        let href = window.location.href;
        let containsText = href.search(msg.text);
        let res;
        console.log('@checkUrlContainText:', msg.text, containsText);

        if (containsText === -1) {
            res = false;
        } else {
            res = true;
        }

        console.log('@url contains text : ', res);
        socket.emit(msg.response, res);

    });

    socket.on('getVKProfileUrl', (msg) => {


        let url = <HTMLLinkElement>$('.name a')[msg.childId];

        let _top = $(url).offset().top;
        let _scroll_height = (_top - window.screen.availHeight) + 400;
        $('html, body').animate({scrollTop: _scroll_height}, 100);

        console.log('@URL : ', url.href);

        socket.emit(msg.response, url.href);
    });


    function customFilter(object, property) {

        if (object !== null) {
            if (object.hasOwnProperty(property)) {
                return object;
            }
            for (let i = 0; i < Object.keys(object).length; i++) {
                if (typeof object[Object.keys(object)[i]] == "object") {
                    let o = customFilter(object[Object.keys(object)[i]], property);
                    if (o != null)
                        return o;
                }
            }
        } else {
            return null;
        }
    }

    socket.on('getPageID', (msg) => {

        let found = false;
        let pageID = null;

        console.log('change');

        $('*[data-store]').each(function (index) {

            if (!found) {

                let dataValue = JSON.parse($($('*[data-store]')[index]).attr('data-store'));
                let dataString = dataValue.dialogURI;


                //let page_id = customFilter(dataValue, 'page_id');


                let substring = "page_id=";

                if (dataString) {
                    console.log(dataString);
                    let startOfPageIdText = dataString.indexOf(substring);
                    if (startOfPageIdText !== -1) {
                        console.log('dataValue: ', dataString);
                        let id = dataString.slice(startOfPageIdText + substring.length, startOfPageIdText + substring.length + 16);

                        console.log("id:", id);
                        if(id.length === 16) {
                            pageID = id;
                            found = true;
                            console.log('found page id: ', id);
                        }

                    }
                }

            }
        });

        if (pageID) {
            socket.emit(msg.response, pageID);
        } else {
            socket.emit(msg.response, false);
        }

    });

    socket.on('parseFriends', (msg) => {

        let container = $('._55wp._4g33._5pxa').first();

        if (!container) {
            setTimeout(() => {
                console.log('Pause parse for 10 seconds !');
                parse();
            }, (1000 * 10));
        } else {
            parse();
        }

        function parse() {
            scrollTo(container);
            parseFriendsCount++;
            if (parseFriendsCount === 1000 || parseFriendsCount === 2000 || parseFriendsCount === 3000 || parseFriendsCount === 4000) {
                resetBrowserStuckTimeout();
            }
            console.log('parseFriendsCount: ', parseFriendsCount);

            let profileUrl = container.find('a').first().attr('href');
            if (container.find('a[data-store]').attr('data-store')) {
                let profileID = JSON.parse(container.find('a[data-store]').attr('data-store')).id;
                let name = container.first().find('a:nth-child(1)').text().replace('Add Friend', '');
                let firstName = name.split(" ")[0];
                let lastName = name.split(" ")[1];

                container.remove();

                socket.emit(msg.response, {
                    profileUrl,
                    profileID,
                    firstName,
                    lastName
                });
            } else {
                socket.emit(msg.response, false);
            }
        }


    });

    function scrollTo(element) {
        if (element.length !== 0) {
            let top = element.first().offset().top;
            let scrollHeight = (top - window.screen.availHeight) + 800;

            $('html, body').animate({
                scrollTop: scrollHeight
            }, 50);
        }
    }

    socket.on('getLikesUrls', (msg) => {


        let url = <HTMLLinkElement>$('.darkTouch')[msg.childId];

        if ($(url).offset()) {
            let _top = $(url).offset().top;
            let _scroll_height = (_top - window.screen.availHeight) + 400;
            $('html, body').animate({scrollTop: _scroll_height}, 100);

            console.log('@URL1: ', url.href);

            socket.emit(msg.response, url.href);
        } else {
            console.log('@URL PARSE DONE. ');
            socket.emit(msg.response, false);
        }

    });

    socket.on('getVKProfileImage', (msg) => {


        let img = $('.ph_img:first');

        if (img !== null) {
            if (img[0]) {

                let imgUrl = <HTMLImageElement>img[0];
                console.log('@image: ', img[0]);
                console.log('@image url: ', imgUrl.src);
                socket.emit(msg.response, imgUrl.src);
            } else {
                socket.emit(msg.response, false);
            }

        } else {
            socket.emit(msg.response, false);
        }

    });

    socket.on('getVKImage', (msg) => {

        $($('.pv_icon')[1]).click();

        setTimeout(() => {
            if ($('#zpv_center > img') !== null) {

                if ($('#zpv_center > img')[0]) {

                    let imgUrl = <HTMLImageElement>$('#zpv_center > img')[0];

                    console.log('@image: ', $('#zpv_center > img')[0]);

                    console.log('@image url: ', imgUrl.src);


                    socket.emit(msg.response, imgUrl.src);
                } else {
                    socket.emit(msg.response, false);
                }

            } else {
                socket.emit(msg.response, false);
            }
        }, 2000);


    });

    socket.on('getVKAllImages', (msg) => {

        let imgArray = [];

        getImgUrls();

        function getImgUrls() {


            let photoUrl = $('.thumb_item').first().attr('href');
            console.log('photoUrl: ', photoUrl);
            if ($('.thumb_item').first().attr('href') !== undefined) {
                imgArray.push(photoUrl);
            }
            $('.thumb_item').first().remove();

            console.log('thumb_item: ', $('.thumb_item').first());
            console.log('thumb_item length: ', $('.thumb_item').first().length);

            setTimeout(() => {

                if ($('.thumb_item').first().length === 0) {
                    if (imgArray.length > 4) imgArray.slice(0, 100);
                    socket.emit(msg.response, imgArray);
                } else {
                    getImgUrls();
                }
            }, 10);
        }
    });

    socket.on('checkCurrentFacebookPage', (msg) => {

        setTimeout(() => {

            let currentState = [
                {
                    query: "Enter your phone number",
                    page: 'visitWithEmail',
                    selector: 'span'
                },
                // Register Facebook
                {
                    query: "What's your name?",
                    page: "inputFirstLastName",
                    selector: 'span'
                }, {
                    query: "Enter Your Name",
                    page: "inputFirstLastName",
                    selector: 'span'
                }, {
                    query: "Enter your email",
                    page: "inputEmail",
                    selector: 'span'
                },
                {
                    query: "Enter the mobile number or email address where you can be reached.",
                    page: "inputEmail",
                    selector: 'span'
                },
                {
                    query: "Enter the mobile number or email where you can be reached.",
                    page: "inputEmail",
                    selector: 'span'
                },
                {
                    query: "birth",
                    page: "inputBirthday",
                    selector: 'span'
                }, {
                    query: "What's your gender?",
                    page: "inputGender",
                    selector: 'span'
                }, {
                    query: "choose your gender",
                    page: "inputGender",
                    selector: 'span'
                }, {
                    query: "Select Your Gender",
                    page: "inputGender",
                    selector: 'span'
                }, {
                    query: "Choose a Password",
                    page: 'inputPassword',
                    selector: 'span'
                }, {
                    query: "Create a Password",
                    page: 'inputPassword',
                    selector: 'span'
                }, {
                    query: "New Password",
                    page: 'inputPassword',
                    selector: 'span'
                }, {
                    query: "Sign Up With Email Address",
                    page: 'visitWithEmail',
                    selector: 'span'
                }, {
                    query: "create a new account in a few easy steps",
                    page: 'nextPage',
                    selector: 'span'
                },
                {
                    query: "Thanks for reviewing",
                    page: 'nextPage',
                    selector: 'div'
                },
                {
                    query: "Your Profile Picture",
                    page: 'nextPage',
                    selector: 'span'
                },
                // Update Info
                {
                    query: "Where did you go to high school?",
                    page: "skipPage",
                    selector: 'span'
                },
                {
                    query: "What city are you from?",
                    page: "inputHomeCity",
                    selector: 'span'
                },
                {
                    query: "Where did you go to college?",
                    page: "inputUniversity",
                    selector: 'span'
                },
                {
                    query: "university",
                    page: "inputUniversity",
                    selector: 'span'
                },
                {
                    query: "University",
                    page: "inputUniversity",
                    selector: 'span'
                },
                {
                    query: "Where do you work?",
                    page: "inputWork",
                    selector: 'span'
                },
                {
                    query: "city do you live in",
                    page: "inputCurrentCity",
                    selector: 'span'
                }, {
                    query: "What did you study",
                    page: "skipPage",
                    selector: 'span'
                },
                {
                    query: "What is your position",
                    page: "skipPage",
                    selector: 'span'
                },
                {
                    query: "Where did you work before",
                    page: "skipPage",
                    selector: 'span'
                },
                {
                    query: "When did you attend",
                    page: "skipPage",
                    selector: 'span'
                }

            ];

            for (let i = 0; i < currentState.length; i++) {

                let element = selectElementByText(currentState[i].query, currentState[i].selector);

                if (checkIfElementIsVisible(element)) {

                    console.log('@Current Page: ', currentState[i].page);

                    socket.emit(msg.response, {
                        currentPage: currentState[i].page,
                    });
                    break;
                }
            }

            function checkIfElementIsVisible(element) {
                return element.is(':visible');
            }

        }, 3000);

    });

    socket.on('checkCurrentLoginPage', (msg) => {

        setTimeout(() => {

            let currentState = [{
                query: "What's your name?",
                page: "inputFirstLastName"
            }, {
                query: "Enter your phone number or email",
                page: "inputEmail"
            }];

            for (let i = 0; i < currentState.length; i++) {

                let element = selectElementByText(currentState[i].query, 'span');

                if (checkIfElementIsVisible(element)) {

                    console.log('@Current Page: ', currentState[i].page);

                    socket.emit(msg.response, {
                        currentPage: currentState[i].page,
                    });
                    break;
                }
            }

            function checkIfElementIsVisible(element) {
                return element.is(':visible');
            }

        }, 3000);

    });

    socket.on('getCurrentLocation', (msg) => {

        socket.emit(msg.response, {
            url: window.location.href
        });
    });

    socket.on('textExists', function (msg) {

        let textExists = false;

        let element = selectElementByText(msg.text, msg.type);

        if (element.length !== 0) {
            textExists = true;
        }

        console.log('@textExists:', msg.text, textExists);

        socket.emit(msg.response, {
            exists: textExists
        });

    });

    socket.emit('currentLocation', window.location);

    socket.on('elementExists', function (msg) {


        let elementExists = false;
        if (msg.text) {
            let element = selectElementByText(msg.text, msg.type);
            console.log('element: ', element);
            if (element.length !== 0) {
                elementExists = true;
            } else {
                elementExists = false;
            }
        } else {
            let str = msg.id;
            let elements = str.split(",");
            let currentElement = '';

            for (let i = 0; i < elements.length; i++) {

                let element = $('#' + elements[i]);
                if (element.offset() != undefined) {
                    elementExists = true;
                    currentElement = elements[i];
                    break;
                }
            }
        }
        socket.emit(msg.response, {
            exists: elementExists
        });

    });

    socket.on('get_liker_btn_position', function (msg) {

        console.log('get liker btn position');

        setTimeout(function () {

            let _element = $('.likercode:first').find('a:first');
            console.log(_element);

            if (_element.length == 0) {
                console.log('no action found !');

                setTimeout(function () {
                    socket.emit('no_action_found');
                }, 6000);

            } else {
                console.log('action found');
                socket.emit(msg.response, {
                    screenWidth: window.screen.availWidth,
                    screenHeight: window.screen.availHeight,
                    top: _element.offset().top,
                    left: _element.offset().left,
                    width: _element.width(),
                    height: _element.height()
                });
            }

        }, 8000);

    });

    socket.on('timelineTextarea', function (msg) {
        let _element = $('textarea');

        console.log('@timelineTextarea: ', _element);

        socket.emit(msg.response, {
            screenWidth: window.screen.availWidth,
            screenHeight: window.screen.availHeight,
            top: (_element.offset().top),
            left: _element.offset().left,
            width: _element.width(),
            height: _element.height()
        });
    });

    socket.on('client_msg_element_info_position', function (msg) {

        console.log('Get Element Position:', msg);
        setTimeout(() => {
            let _element;

            if (msg.ofType) {

                console.log('@get element: ', msg.ofType);

                _element = $(msg.ofType);

                console.log('@selected element: ', _element);

                let _top = _element.offset().top;
                let _screen_height = window.screen.availHeight;

                console.log(_element);

                if ((_top + 20) > _screen_height) {


                    let _scroll_height = (_top - _screen_height) + 50;
                    console.log('element outside the screen, scroll down: ' + _scroll_height);
                    $('html, body').animate({scrollTop: _scroll_height}, 100);

                    socket.emit(msg.response, {
                        screenWidth: window.screen.availWidth,
                        screenHeight: window.screen.availHeight,
                        top: (_element.offset().top - _scroll_height),
                        left: _element.offset().left,
                        width: _element.width(),
                        height: _element.height()
                    });

                } else {
                    console.log('element inside the screen!');

                    socket.emit(msg.response, {
                        screenWidth: window.screen.availWidth,
                        screenHeight: window.screen.availHeight,
                        top: (_element.offset().top),
                        left: _element.offset().left,
                        width: _element.width(),
                        height: _element.height()
                    });
                }
            }
            if (msg.id) {

                _element = $($("#" + msg.id)[0]);

                if (_element.offset() == 'undefined') {
                    console.log('ELEMENT NOT FOUND Selector ID');
                    socket.emit(msg.response, false);
                } else {
                    let _top = _element.offset().top;
                    let _screen_height = window.screen.availHeight;
                    if (_element.offset() == undefined) {
                        console.log('ELEMENT NOT FOUND Selector ID');
                        socket.emit(msg.response, false);

                    } else {
                        if ((_top + 20) > _screen_height) {
                            let _scroll_height = (_top - _screen_height) + 50;
                            console.log('element outside the screen, scroll down: ' + _scroll_height);
                            $('html, body').animate({scrollTop: _scroll_height}, 100);

                            socket.emit(msg.response, {
                                screenWidth: window.screen.availWidth,
                                screenHeight: window.screen.availHeight,
                                top: (_element.offset().top - _scroll_height),
                                left: _element.offset().left,
                                width: _element.width(),
                                height: _element.height()
                            });

                        } else {
                            console.log('element inside the screen!');

                            console.log('@_element.offset().top :: ', _element.offset().top);
                            socket.emit(msg.response, {
                                screenWidth: window.screen.availWidth,
                                screenHeight: window.screen.availHeight,
                                top: (_element.offset().top),
                                left: _element.offset().left,
                                width: _element.width(),
                                height: _element.height()
                            });
                        }
                    }
                }


            } else {
                if (msg.text) {
                    _element = selectElementByText(msg.text, msg.type, msg.position);
                    console.log('Select by text');
                } else if (msg.selectClass) {
                    console.log('@selectClass : ', msg);
                    _element = $("." + msg.selectClass).first();
                } else {
                    console.log('@element position: ', msg.position);
                    _element = $("." + msg.class + ":eq( " +
                        msg.position + " )" + ":first " + msg.type);
                    console.log('Select by class');
                }

                let _top = _element.offset().top;
                let _screen_height = window.screen.availHeight;

                console.log('top: ' + _top);
                console.log('screen height: ' + _screen_height);

                if ((_top + 20) > _screen_height) {

                    let _scroll_height = (_top - _screen_height) + 50;
                    console.log('element outside the screen, scroll down: ' + _scroll_height);
                    $('html, body').animate({scrollTop: _scroll_height}, 100);

                    socket.emit(msg.response, {
                        screenWidth: window.screen.availWidth,
                        screenHeight: window.screen.availHeight,
                        top: (_element.offset().top - _scroll_height),
                        left: _element.offset().left,
                        width: _element.width(),
                        height: _element.height()
                    });


                } else {
                    console.log('element inside the screen');

                    socket.emit(msg.response, {
                        screenWidth: window.screen.availWidth,
                        screenHeight: window.screen.availHeight,
                        top: _element.offset().top,
                        left: _element.offset().left,
                        width: _element.width(),
                        height: _element.height()
                    });

                }

            }
            console.log('@element: ', _element);

        }, 2000);

    });

    socket.on('getElementPosText', (msg) => {

        console.log('@getElementPosOld: ', msg);
        setTimeout(() => {

            let domElement;
            let topPos;

            let leftPos;

            if (msg.clickElements) {
                //domElement = $(msg.clickElements);
                console.log('@JQUERY DOM ELEMENT FOUND ? ', msg.clickElements);
                domElement = selectRandomElementByText(msg.text, msg.clickElements);
                console.log('@DOM ELEMENT WITH TEXT FOUND ?: ', domElement);
            } else if (msg.random) {
                domElement = selectRandomElementByText(msg.text, msg.type);
            } else {
                domElement = selectElementByText(msg.text, msg.type, msg.position);
            }
            console.log('Element:', domElement);

            if (domElement.length) {
                let _top = domElement.offset().top;

                let _screen_height = window.screen.availHeight;

                if ((_top + 20) > _screen_height) {

                    console.log('element outside the screen');

                    let _scroll_height = (_top - _screen_height) + 120;
                    $('html, body').animate({
                        scrollTop: _scroll_height
                    }, 60);

                    topPos = domElement.offset().top - _scroll_height;
                    leftPos = domElement.offset().left;
                } else {
                    topPos = domElement.offset().top;
                    leftPos = domElement.offset().left;
                    console.log('element inside the screen');
                }
            }


            if (domElement.length) {
                socket.emit(msg.response, {
                    screenWidth: window.screen.availWidth,
                    screenHeight: window.screen.availHeight,
                    top: topPos,
                    left: leftPos,
                    width: domElement.width(),
                    height: domElement.height()
                });
            } else {
                socket.emit(msg.response, false);
            }


        }, 1000);
    });

    socket.on('setValue', (msg) => {
        if ($(msg.selector[isMobile()]).length !== 0) {
            (<HTMLInputElement>$(msg.selector[isMobile()])[0]).value = msg.val;
        }
        if (msg.response) socket.emit(msg.response, $(msg.selector[isMobile()]).length !== 0);
    });

    socket.on('setEnabled', (msg) => {
        if ($(msg.selector).length !== 0) {
            $(msg.selector).prop('disabled', false);
        }
        if (msg.response) socket.emit(msg.response, $(msg.selector[isMobile()]).length !== 0);
    });

    socket.on('click', (msg) => {

        if ($(msg.selector[isMobile()]).length !== 0) {
            let element = $(msg.selector[isMobile()]);
            scrollTo(element);
            setTimeout(() => {
                console.log(element);
                if (element.length !== 0) {
                    element[0].click();
                }
                if (msg.response) socket.emit(msg.response, element.length !== 0);
            }, 300);
        }


    });

    socket.on('clickText', (msg) => {

        console.log('clickText: ', msg.text);
        console.log('clickText: ', msg.type);

        let element = selectVisibleElementByText(msg.text, msg.type);

        console.log('Element is: ', element);

        scrollTo(element);

        setTimeout(() => {
            console.log(element);
            element[0].click();
            if (msg.response) socket.emit(msg.response, element.length !== 0);
        }, 300);

    });


    socket.on('getActionBtnPos', (msg) => {

        let elements = $(msg.type + ':contains("' + msg.text + '")').filter(function () {
            return $(this).text() == msg.text;
        });

        console.log('Click element.');

        setTimeout(() => {


            let domElement = null;
            let topPos;
            let leftPos;

            elements.each((i, element) => {

                console.log('elements.length', elements.length);
                console.log('index ', i);

                console.log('This: ', element);

                let isVisible = $(element).is(":visible");

                console.log('Visible: ', isVisible);

                if (isVisible) {
                    console.log('Element found: ' + element);
                    domElement = $(element);

                    console.log('SELECTED ELEMENT:', domElement);

                    if (domElement.length > 0) {
                        let _top = domElement.offset().top;

                        let _screen_height = window.screen.availHeight;

                        if ((_top + 50) > _screen_height) {

                            console.log('element outside the screen');

                            let _scroll_height = (_top - _screen_height) + 120;

                            $('html, body').animate({
                                scrollTop: _scroll_height
                            }, 60);

                            topPos = domElement.offset().top - _scroll_height;
                            leftPos = domElement.offset().left;
                        } else {
                            topPos = domElement.offset().top;
                            leftPos = domElement.offset().left;
                            console.log('element inside the screen');
                        }
                    }

                    if (domElement.length > 0 && domElement.width !== 0) {
                        socket.emit(msg.response, {
                            screenWidth: window.screen.availWidth,
                            screenHeight: window.screen.availHeight,
                            top: topPos,
                            left: leftPos,
                            width: domElement.width(),
                            height: domElement.height()
                        });
                    } else {
                        socket.emit(msg.response, false);
                    }
                    return false;
                } else {

                    console.log('elements.length if invisible: ', elements.length);

                    console.log('index if invisible: ', i);

                    if (elements.length == (i - 1)) {
                        socket.emit(msg.response, false);
                    }
                }


            });


        }, 2000);

    });

    socket.on('getElementPos', (msg) => {
        if (window.screen.availWidth == 960 && window.screen.availHeight == 600) {
            setTimeout(() => {


                let domElement;
                let topPos;
                let leftPos;

                if (msg.selector && !msg.text) {
                    if (msg.type) {
                        domElement = $(msg.type + msg.selector);
                    } else {
                        domElement = $(msg.selector);
                    }
                    console.log('@selected by selector: ', msg.selector);
                } else if (msg.text && msg.visible) {
                    domElement = selectVisibleElementByText(msg.text, msg.type, msg.position);
                } else if (msg.text && msg.random) {
                    domElement = selectRandomElementByText(msg.text, msg.type);
                    console.log('@selected by text and random:', msg.text);
                } else if (msg.text) {
                    domElement = selectElementByText(msg.text, msg.type, msg.position);
                }


                console.log('SELECTED ELEMENT:', domElement);

                if (domElement.length > 0) {
                    let _top = domElement.offset().top;

                    let _screen_height = window.screen.availHeight;

                    if ((_top + 50) > _screen_height) {

                        console.log('element outside the screen');

                        let _scroll_height = (_top - _screen_height) + 120;
                        $('html, body').animate({
                            scrollTop: _scroll_height
                        }, 60);

                        topPos = domElement.offset().top - _scroll_height;
                        leftPos = domElement.offset().left;
                    } else {
                        topPos = domElement.offset().top;
                        leftPos = domElement.offset().left;
                        console.log('element inside the screen');
                    }
                }

                if (domElement.length > 0 && domElement.width !== 0) {
                    socket.emit(msg.response, {
                        screenWidth: window.screen.availWidth,
                        screenHeight: window.screen.availHeight,
                        top: topPos,
                        left: leftPos,
                        width: domElement.width(),
                        height: domElement.height()
                    });
                } else {
                    socket.emit(msg.response, false);
                }


            }, 1000);
        }
    });

    socket.on('clickElementPos', (msg) => {

        setTimeout(() => {


            let domElement;
            if (msg.selector && !msg.text) {
                if (msg.type) {
                    domElement = $(msg.type + msg.selector);
                } else {
                    domElement = $(msg.selector);
                }
                console.log('@selected by selector: ', msg.selector);
            } else if (msg.text && msg.visible) {
                domElement = selectVisibleElementByText(msg.text, msg.type, msg.position);
            } else if (msg.text && msg.random) {
                domElement = selectRandomElementByText(msg.text, msg.type);
                console.log('@selected by text and random:', msg.text);
            } else if (msg.text) {
                domElement = selectElementByText(msg.text, msg.type, msg.position);
            }


            console.log('SELECTED ELEMENT:', domElement);

            if (domElement.length > 0) {
                let _top = domElement.offset().top;

                let _screen_height = window.screen.availHeight;

                if ((_top + 50) > _screen_height) {

                    console.log('element outside the screen');

                    let _scroll_height = (_top - _screen_height) + 120;
                    $('html, body').animate({
                        scrollTop: _scroll_height
                    }, 60);

                } else {
                    console.log('element inside the screen');
                }
            }

            setTimeout(() => {
                if (domElement.length > 0 && domElement.width !== 0) {
                    $(domElement).trigger('click');
                } else {
                    $(domElement).trigger('click');
                }
            }, 400);


        }, 1000);
    });

    socket.on('getElementClass', (msg) => {


        setTimeout(() => {
            let domElement;
            let topPos;
            let leftPos;

            console.log('Get Element Position:', msg);

            if (msg.random) {
                domElement = selectRandomElementByClass(msg.classText, msg.type);
            } else {
                domElement = selectElementByClass(msg.classText, msg.type, msg.position);
            }

            console.log('@Selected element: ', domElement);

            if (domElement.length) {
                let _top = domElement.offset().top;

                let _screen_height = window.screen.availHeight;

                if ((_top + 20) > _screen_height) {
                    console.log('element outside the screen');
                    let _scroll_height = (_top - _screen_height) + 100;

                    $('html, body').animate({
                        scrollTop: _scroll_height
                    }, 100);

                    topPos = domElement.offset().top - _scroll_height;
                    leftPos = domElement.offset().left;
                } else {
                    topPos = domElement.offset().top;
                    leftPos = domElement.offset().left;
                    console.log('element inside the screen');
                }
            }


            if (domElement.length) {
                socket.emit(msg.response, {
                    screenWidth: window.screen.availWidth,
                    screenHeight: window.screen.availHeight,
                    top: topPos,
                    left: leftPos,
                    width: domElement.width(),
                    height: domElement.height()
                });
            } else {
                socket.emit(msg.response, false);
            }


        }, 1000);


    });

    socket.on('get_id_position', function (msg) {

        setTimeout(function () {

            let _element = $('#event_button_bar');
            console.log('element >>');
            console.log(_element);


            socket.emit(msg.response, {
                screenWidth: window.screen.availWidth,
                screenHeight: window.screen.availHeight,
                top: _element.offset().top,
                left: _element.offset().left,
                width: _element.width(),
                height: _element.height()
            });


        }, 3000);

    });

    socket.on('class_get_position', function (msg) {

        setTimeout(function () {
            let comment_iframe = $($('iframe')[3]);
            let element = comment_iframe.contents().find("body .UFIInputContainer");

            console.log('get input');
            console.log(msg.class);
            console.log(element);

            socket.emit(msg.response, {
                screenWidth: window.screen.availWidth,
                screenHeight: window.screen.availHeight,
                top: element.offset().top,
                left: element.offset().left,
                width: element.width(),
                height: element.height()
            });


        }, 2000);

        setTimeout(function () {
            console.log('30 seconds passed. Action stuck !');
            socket.emit('no_action_found');
        }, 30000);
    });

    socket.on('get_captcha_img', function (msg) {

        console.log('selector: ', msg.selector);
        let url = $(msg.selector)[0];

        console.log('get_captcha_img: ', url);

        let ImgBase64 = getBase64Image(url);

        socket.emit(msg.response, {
            data: ImgBase64,
        });
    });


    socket.on('get_fb_captcha_img', function (msg) {
        let url = document.getElementById(msg.id).getElementsByTagName('img')[0];
        console.log('FB captcha url: ', url);
        let ImgBase64 = getBase64Image(url);

        socket.emit(msg.response, {
            data: ImgBase64,
        });
    });

}

function setEmitters() {

    emitKillScript(socket);


    socket.emit('client_msg_connect', {
        browserInfo: {
            screenWidth: window.screen.width,
            screenHeight: window.screen.height
        },
        location: window.location
    });
}


let browserStuckTimeout;

function emitBrowserStuck(socket) {
    setTimeout(() => {
        console.log('Browser will restart in 4 min if stuck');
    }, 1000);

    browserStuckTimeout = setTimeout(() => {
        console.log('Browser stuck for 4 min on same window. Kill Browser.');
        socket.emit('browser_kill', true);
    }, 240000);

}

emitBrowserStuck(socket);

function resetBrowserStuckTimeout() {
    console.log('Reset resetBrowserStuckTimeout');
    clearTimeout(browserStuckTimeout);
    emitBrowserStuck(socket);
}

function emitKillScript(socket) {
    $(document).keyup(function (e) {
        if (e.keyCode == 27) {
            console.log('@ESC Press kill script.');
            socket.emit('terminate_script', true);
            socket.disconnect();
        }
    });
}

function selectElementByClass(classText, type, pos?) {

    let elementsArray = $(type + classText + classText);

    console.log('@elementsArray Select by Class', elementsArray);
    if (pos) {
        return $(elementsArray[pos]);
    } else {
        return $(elementsArray[0]);
    }
}

function selectRandomElementByClass(classText, type) {

    let elementsArray = $(type + classText + classText);

    console.log('@elementsArray Select by Class Random: #######: ', elementsArray);

    return $(elementsArray[random(0, (elementsArray.length - 1))]);
}

function selectRandomElementByText(text, type) {

    let elementsArray = $(type).filter(function () {
        return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
    });

    console.log('@elementsArray: #######: ', elementsArray);

    return $(elementsArray[random(0, (elementsArray.length - 1))]);
}

function selectVisibleElementByText(text, selector, pos?) {

    console.log('selectElementByText Selector: ', selector);
    console.log('@selectElementByText position: ', text, pos);

    if (pos) {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }).eq(pos);
    } else {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }).first();
    }
}

function selectElementByText(text, selector, pos?) {

    console.log('selectElementByText Selector: ', selector);
    console.log('@selectElementByText position: ', text, pos);

    if (pos) {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }).eq(pos);
    } else {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }).first();
    }
}

/*UTILS*/

// TODO move this in separated modules

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getBase64Image(img) {

    console.log('BASE 64 IMG URL: ', img);
    // Create an empty canvas element
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // will re-encode the image.
    let dataURL = canvas.toDataURL("image/png");
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}