// http module should be installed:
// npm i http

// Params:
// your anti-captcha.com account key
var anticaptcha = require('./anticaptcha')('12345678901234567890123456789012');

//recaptcha key from target website
anticaptcha.setWebsiteURL("http://mywebsite.com/recaptcha/test.php");
anticaptcha.setWebsiteKey("sitekey-can-be-taken-from-div.g-recaptcha-element");

//proxy access parameters
anticaptcha.setProxyType("http");
anticaptcha.setProxyAddress("proxyaddress");
anticaptcha.setProxyPort(8080);
anticaptcha.setProxyLogin("proxylogin");
anticaptcha.setProxyPassword("proxypassword");

//browser header parameters
anticaptcha.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116");

// check balance first
anticaptcha.getBalance(function (err, balance) {
    if (err) {
        console.error(err);
        return;
    }

    if (balance > 0) {
        anticaptcha.createTask(function (err, taskId) {
            if (err) {
                console.error(err);
                return;
            }

            console.log(taskId);

            anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
                if (err) {
                    console.error(err);
                    return;
                }

                console.log(taskSolution);
            });
        });
    }
});