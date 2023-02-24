/*
var socket = io('http://localhost:' + 3000, {
    'reconnection': true,
    'reconnectionDelay': 600,
    'reconnectionAttempts': 30
});

console.log('cookie @index.ts');

socket.on('getFacebookCookie', function (msg) {

    console.log('@getFacebookCookie');

});

socket.on('applyFacebookCookie', function (msg) {

    console.log('@Apply facebook cookie ', msg);

    var cookieArray = msg.data;

    for (var i = 0; i < cookieArray.length; i++) {

        var cJSON = cookieArray[i];
    }

    socket.emit(msg.response, true);

});


*/
