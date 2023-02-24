$(function () {

    let currentRoutione = '';

    chrome.storage.sync.get("groupCountry", function (storage) {
        $('#groupCountry').val(storage.groupCountry);
    });
    chrome.storage.sync.get("groupName", function (storage) {
        $('#groupName').val(storage.groupName);
    });
    chrome.storage.sync.get("groupID", function (storage) {
        $('#groupID').val(storage.groupID);
    });

    $('#save-group').click(function () {

        console.log('Save Values');
        let tempCountry = $('#groupCountry').val();
        let groupName = $('#groupName').val();
        let groupID = $('#groupID').val();

        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({'groupCountry': tempCountry}, function () {
        });
        chrome.storage.sync.set({'groupName': groupName}, function () {
        });
        chrome.storage.sync.set({'groupID': groupID}, function () {
        });
    });

    $('#removePendingFriends').click(function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            chrome.tabs.sendMessage(tabs[0].id, {
                message: "removePendingFriends",
                data: false
            });

            setTimeout(() => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    message: "removePendingFriends",
                    data: true
                });
            }, 4000);


        });
    });

    $('#parse-group').click(function () {

        console.log('Click parse group btn');
        /*Send message from Extension */
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            chrome.tabs.sendMessage(tabs[0].id, {
                message: "startParseGroup",
                data: {
                    groupAddFriend: $('#groupAddFriend').val(),
                    country: $('#groupCountry').val(),
                    groupName: $('#groupName').val(),
                    groupID: $('#groupID').val(),
                }
            }, function (response) {
            });
        });

    });

    $('#pageInviteAll').click(function () {

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                message: "pageInviteAll",
            });
        });

    });

    $('#stop-parse-group').click(function () {

        console.log('Click stop parse group');

        /*Send message from Extension */
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            chrome.tabs.sendMessage(tabs[0].id, {
                message: "stopParseGroup",
                data: {
                    groupAddFriend: $('#groupAddFriend').val()
                }
            }, function (response) {
            });
        });

    });

    $('#injectSubmit').click(function () {

        /*Send message from Extension */
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            chrome.tabs.sendMessage(tabs[0].id, {
                message: "injectCode",
                data: $('#injectCode').val()
            }, function (response) {
                /*console.log(response.farewell);*/
            });

        });
    });

    $('#logCode').click(function () {

        /*Send message from Extension */
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {

            chrome.tabs.sendMessage(tabs[0].id, {
                message: "logCode",
                data: $('#injectCode').val()
            }, function (response) {
                /*console.log(response.farewell);*/
            });

        });
    });

    chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.action == "getSource") {
        }
    });

});

