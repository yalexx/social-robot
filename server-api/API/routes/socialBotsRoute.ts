import * as express from "express";
import Request = require("request");
import {SETTINGS} from "../../../settings";

const router = express.Router();
let notDisplayKIDCount = 0;

router.get('/notDisplay/:kid', (req, res, next) => {

    notDisplayKIDCount++;
    console.log('KIDs blocked: ', notDisplayKIDCount);
    console.log('KID: ', req.params.kid);
    Request(SETTINGS.SOCIALTRACK_NOT_DISPLAY + req.params.kid, (err, response, body) => {
        console.log('@not_display res:', body);
        res.status(200).json({
            message: 'socialBots notDisplay send KID: ' + req.params.kid,
            response: body,
        });
    });
});

router.get('/resetDisplay', (req, res, next) => {

    Request(SETTINGS.SOCIALTRACK_RESET_DISPLAY, (err, response, body) => {
        console.log('@reset_display res:', req.body.parse);

        res.status(200).json({
            message: 'reset_display send',
            response: req.body.parse
        });
    });

});

module.exports = router;