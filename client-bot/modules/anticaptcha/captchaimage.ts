import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

// anti-captcha.com account key
let APIkey = '1d241a41a736a0787666f78ec5b976f9';

let anticaptcha = require('./anticaptcha')(APIkey);

export module Anticaptcha {

    export function solveImage(dataURI): Observable<any> {


        return Observable.create(observer => {

            anticaptcha.getBalance((err, balance) => {

                if (err) {
                    observer.error(err);
                    return;
                }

                // captcha params can be set here
                anticaptcha.setMinLength(5);
                console.log('Send Captcha for solving.');

                if (balance > 0) {
                    anticaptcha.createImageToTextTask({
                            case: true,
                            body: dataURI
                        },
                        function (err, taskId) {
                            if (err) {
                                observer.error(err);
                                return;
                            }

                            anticaptcha.getTaskSolution(taskId, function (err, taskSolution) {
                                if (err) {
                                    observer.error(err);
                                    return;
                                }

                                observer.next(taskSolution);
                                observer.complete();
                            });
                        }
                    );
                }
            });

        });

    }

}
