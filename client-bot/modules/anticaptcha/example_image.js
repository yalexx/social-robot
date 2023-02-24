// http module should be installed:
// npm i http

// Params:
// your anti-captcha.com account key
var anticaptcha = require('./anticaptcha')('1d241a41a736a0787666f78ec5b976f9');

// check balance first
anticaptcha.getBalance(function (err, balance) {
    if (err) {
        console.error(err);
        return;
    }

    // captcha params can be set here
    anticaptcha.setMinLength(5);

    if (balance > 0) {
        anticaptcha.createImageToTextTask({
                case: true, // or params can be set for every captcha specially
                body: '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'
            },
            function (err, taskId) {
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
            }
        );
    }
});