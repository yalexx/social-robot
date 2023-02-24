/*Receive message from extension*/
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (sender.tab) console.log('sender.tab: ', sender.tab);

        switch (request.message) {
            case 'addFriends':
                addFriends(request.data);
                break;
            case 'logCode':
                injectCode(request);
                break;
            case 'injectCode':
                injectCode(request);
                break;
            case 'startParseGroup':
                pause = false;
                console.log('request:');
                console.log(request);
                addFriend = request.data.groupAddFriend;
                country = request.data.country;
                groupName = request.data.groupName;
                groupID = request.data.groupID;
                parseGroup(request.data);
                break;
            case 'stopParseGroup':
                pause = true;
                parseGroup(request.data);
                break;
            case 'removePendingFriends':
                removePendingFriends(request.data);
                break;
            case 'pageInviteAll':
                pageInviteAll();
                break;
        }
    });

let count = 0;
let pause = false;
let addFriend = '0';
let country = null;
let groupName = null;
let groupID = null;
let removeRequestsCount = 0;
function removePendingFriends(data) {
    if (window.location.href !== 'https://www.facebook.com/friends/requests/?fcref=none&outgoing=1') {
        window.location.href = 'https://www.facebook.com/friends/requests/?fcref=none&outgoing=1';
    }
    else {
        removeRequests();
        function removeRequests() {

            if ($('.FriendRequestOutgoing:visible')[0] === undefined) {

                let seeMoreBtn = $('.uiMorePager:visible');
                $(seeMoreBtn).find('a').first()[0].click();
                setTimeout(() => {
                    removeRequests();
                }, 1500);
            }
            else {
                $($('.FriendRequestOutgoing:visible')[0]).trigger('click');
                scrollTo($($('.FriendRequestOutgoing:visible')[0]));
                setTimeout(() => {
                    $($('.FriendListCancel:visible')[0]).trigger('click');

                    setTimeout(() => {
                        $($('.layerConfirm:visible')[0]).trigger('click');

                        setTimeout(() => {
                            removeRequestsCount++;
                            console.log('removeRequestsCount: ', removeRequestsCount);
                            removeRequests();
                        }, 1500);

                    }, 600);

                }, 600);
            }

        }
        /*let element = selectVisibleElementByText('View Sent Requests', 'a', 1);*/
    }
}

function parseGroup(requestData?) {

    let timeout1 = 400;
    if (addFriend === '1') {
        timeout1 = 9000;
    }

    count++;
    console.log('Start Parse Group, element: ', count);


    let containerSelector = 'things_in_common_';
    let userContainer = $('*[id*=' + containerSelector + ']:visible').first();

    if ($(userContainer).length !== 0) {
        scrollTo($(userContainer));

        console.log('timeout1: ', timeout1);


        console.log('addFriend: ', addFriend);
        if (addFriend === '1') {
            let friendBtn = $(userContainer).find('.FriendRequestAdd').first();
            if (friendBtn.length > 0) {
                $(userContainer).find('.FriendRequestAdd').first()[0].click();
            }

            setTimeout(() => {
                confirmAndCancel();
            }, 2000);
        }

        let name = $($(userContainer).find('a')[1]).text();

        console.log($(userContainer).find('a').length);

        let fbID = $(userContainer).attr('id');
        let userUrl = $(userContainer).first().find('a').first().attr('href').split("facebook.com")[1];
        userUrl = userUrl.split("&")[0];

        fbID = fbID.split(containerSelector)[1];
        $(userContainer).removeAttr("id");

        console.log('fbID: ', fbID);
        console.log('name: ', name);
        console.log('userUrl: ', userUrl);

        let firstName = name.split(' ')[0];
        let familyName = name.split(' ')[1];

        if (fbID && firstName && familyName && country && groupName && groupID) {
            let data = {
                facebookID: fbID,
                name: firstName,
                familyName: familyName,
                userUrl: userUrl,
                country: country,
                groupName: groupName,
                groupID: groupID,
            };
            saveFbSid(data);
        }
        else {
            console.log('####### PARSE ERROR, INfo missing !!!!');
        }


        setTimeout(() => {
            if (!pause) parseGroup();
        }, timeout1);
    }
    else {

        setTimeout(() => {
            let seeMoreBtn = $('.uiMorePager:visible');
            $(seeMoreBtn).find('a').first()[0].click();

            setTimeout(() => {
                if (!pause) parseGroup();
            }, timeout1 * 2);

        }, timeout1);

    }

}

function saveFbSid(data) {
    $.ajax({
        type: "POST",
        url: 'http://social-robot.hopto.org:3333/fbSids/save',
        data
    });
}

function scrollTo(element) {
    let top = element.first().offset().top;
    let scrollHeight = (top - window.screen.availHeight) + 800;

    $('html, body').animate({
        scrollTop: scrollHeight
    }, 50);
}

function addFriends(data) {
    console.log('Start Adding Friends');
    let inputs = $('.FriendRequestAdd');

    /*console.log(inputs);*/
    clickAdd();
}

function clickAll(selector) {
    let inputs = $(selector);
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].click();
    }
}

function pageInviteAll(data?) {

    let element = selectVisibleElementByText('Invite', 'button', 1);
    let parentContainer = $(element).parents('li').first();
    console.log('Invite:');
    console.log(element);

    $(element).trigger('click');

    setTimeout(() => {
        $(parentContainer).remove();

        setTimeout(() => {
            pageInviteAll();
        }, 300);
    }, 1000);


    console.log('parentContainer');
    console.log(parentContainer);


    /*var e = $.Event("DOMMouseScroll", {delta: -200});
     $($(".uiScrollableAreaBody")[2]).sectrigger(e);

     $( "#target" ).scroll();*/
}

let index = 0;
function clickAdd() {

    console.log('INDEX: ', index);
    let element = selectVisibleElementByText('Add Friend', 'button', index);

    console.log('element:', element);
    console.log('element length:', element.length);

    if (element.length === 1) {
        setTimeout(function () {
            element.first().trigger("click");
        }, 500);


        setTimeout(function () {

        }, 3000);
    }


    /*console.log('@URL1: ', url.href);*/
    setTimeout(function () {
        index++;
        clickAdd();
    }, 4000);

}

function confirmAndCancel() {
    if ($('.layerConfirm')) {
        clickAll('.layerConfirm');
        console.log('CLOSE CONFIRM');
    }
    if ($('.layerCancel')) {
        clickAll('.layerCancel');
        console.log('CLOSE CANCEL');
    }
}

let port_number = 3000;
const tabletWidth = 960;

function selectElementByClass(classText, type, pos?) {

    let elementsArray = $(type + classText + classText);

    console.log('@elementsArray Select by Class', elementsArray);
    if (pos) {
        return $(elementsArray[pos]);
    }
    else {
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
    }
    else {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        });
    }
}

function selectElementByText(text, selector, pos?) {

    console.log('selectElementByText Selector: ', selector);
    console.log('@selectElementByText position: ', text, pos);

    if (pos) {
        return $(selector).filter(function () {
            return $(this).text().toLowerCase().indexOf(text.toLowerCase()) >= 0;
        }).eq(pos);
    }
    else {
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

/*Inject Jquery*/

try {
    $.getScript("//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js", function (data, textStatus, jqxhr) {
        console.log('Jquery injected: ' + jqxhr.status); //200
    });
}
catch (err) {
    console.log(err);
}

function injectCode(request) {
    try {
        let elem = document.createElement("script");
        elem.type = "text/javascript";

        if (request.message === 'logCode') {
            elem.innerHTML = 'console.log(' + request.data + ');';
        }
        else {
            elem.innerHTML = request.data;
        }
        document.getElementsByTagName("body")[0].appendChild(elem);
    }
    catch (err) {
        console.log(err);
    }
}

