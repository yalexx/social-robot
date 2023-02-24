document.addEventListener("DOMContentLoaded", function (event) {
    setTimeout(function () {
        console.log('Redirect!');
        window.location.href = 'http://google.com';
    }, 3000);
});
/*

$(function () {

    let currentRoutione = '';
    chrome.storage.sync.get("port_value", function (obj) {
        currentRoutione = obj.port_value;
        $('#current-port').text('current routine: ' + currentRoutione);
    });

    let curr_sid_value = '';
    chrome.storage.sync.get("sid_value", function (obj) {
        curr_sid_value = obj.sid_value;
        $('#current-sid').text('current sid: ' + curr_sid_value);
    });

    $('#submit-port').click(function () {

        let port_value = $('#port-input').val();
        $('#current-port').text('Routine name: ' + port_value);

        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({'port_value': port_value}, function () {
        });

    });

    $('#submit-sid').click(function () {

        let sid_value = $('#sid-input').val();
        $('#current-sid').text('current sid:: ' + sid_value);


        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({'sid_value': sid_value}, function () {

            // Notify that we saved.
            console.log('Settings saved: ' + sid_value);
        });

    });


    chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.action == "getSource") {
            //message.innerText = 'Start';
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.action == "serverMessage") {
            //message.innerText = request.source;
        }
    });

    chrome.tabs.onUpdated.addListener(function(tab) {

        /!*chrome.tabs.executeScript(null, { file: "jquery.js" }, function() {
        });*!/

        chrome.tabs.executeScript(tab, {
            file: 'fullscreen.js'
        });
        /!*chrome.tabs.executeScript(null, { file: "jquery.js" }, function() {
            chrome.tabs.executeScript(null, { file: "content_script.js" });
        });*!/
    });

});

*/
