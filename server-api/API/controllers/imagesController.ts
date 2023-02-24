const googleAPIKey = 'AIzaSyDHljWKvA8BaWbdw9dc31EvYRPcANVtIC8';
/*controlwemaptech5@gmail.com*/
const googleVisionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleAPIKey}`;
let request = require('request');
const _ = require('lodash');
const i2b = require("imageurl-base64");
export let checkText = (req: any, res: any, next: any) => {

    i2b(req.body.imgUrl, function (err: any, data: any) {
        console.log('imgUrl: ', req.body.imgUrl);
        request.post({
            headers: {'content-type': 'application/json'},
            url: googleVisionUrl,
            body: JSON.stringify({
                "requests": [
                    {
                        "image": {
                            "content": data.base64
                        },
                        "features": [
                            {
                                "type": "TEXT_DETECTION"
                            }
                        ]
                    }
                ]
            })

        }, function (error: any, response: any, body: any) {
            if (error) {
                console.log('error: ', error);
                res.status(500).json({
                    message: JSON.parse(error)
                });
            }
            else {
                let data = JSON.parse(body);
                console.log();
                if (data.error) {
                    res.status(200).json({
                        text: data.error
                    });
                }
                else {
                    let imageData = data.responses[0];

                    if (_.isEmpty(imageData)) {
                        res.status(200).json({
                            haveText: false,
                            imgUrl: req.body.imgUrl
                        });
                    }
                    else {
                        res.status(200).json({
                            haveText: true,
                            text: imageData.textAnnotations[0].description
                        });
                    }
                }

            }
        });
    });

};