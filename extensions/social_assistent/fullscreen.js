/*
function $(id) {
    return document.getElementById(id);
}

if (document.documentElement.requestFullScreen) {
    document.documentElement.requestFullScreen();
}
else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen();
}
else if (document.documentElement.webkitRequestFullScreen) {
    document.documentElement.webkitRequestFullScreen();
}

(function () {


    var script = document.createElement('script');
    script.type = 'text/javascript';

    script.text = "function prepareButton() {\n" +
        "        console.log('CLICK EXECUTED');\n" +
        "        chrome.runtime.sendMessage('cobfakkgmalnbjodgjlbldkopnibjema', {fullscreen: 'fullscreen'}, function(response) {});\n" +
        "    }";

    document.body.appendChild(script);


    var div = document.createElement('div');
    div.style.position = 'fixed';
    div.style.top = 0;
    div.style.left = 0;
    div.style.width = '30px';
    div.style.height = '30px';

    div.innerHTML = '<button style="width: 100%; height: 100%; display: block;" id="fullDivBtn" onclick="prepareButton()">x</button>';

    div.setAttribute("id", "fullDiv");

    document.body.appendChild(div);


    /!*alert('inserted self... giggity');*!/

})();
*/
