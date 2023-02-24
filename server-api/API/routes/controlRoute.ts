import * as express from "express";
import * as mongoose from "mongoose";
import {ControlModel} from "../../models/controlModel";
import {SidModel} from "../../models/sidModel";

const router = express.Router();
let _ = require('lodash');


router.post('/setLoginRequest', (req: any, res: any, next: any) => {

    ControlModel.findOne({containerID: req.body.containerID}, function (err, loginRequest) {
        if (!err) {
            if (loginRequest) {
                console.log('remove loginRequest: ', loginRequest);
                loginRequest.remove();

            }
            const control = new ControlModel({
                _id: new mongoose.Types.ObjectId(),
                SIDId: req.body.SIDId,
                containerID: req.body.containerID
            });
            control.save().then((result: any) => {
                console.log(result);
                res.status(201).json({
                    message: 'Control Login Request Created'
                });
            })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    })
                });
        }
    });

});

router.post('/removeLoginRequest', (req: any, res: any, next: any) => {

    ControlModel.findOne({containerID: req.body.containerID}, function (err, loginRequest) {
        if (!err) {
            if (loginRequest) {
                console.log('remove loginRequest: ', loginRequest);
                loginRequest.remove();
                res.status(200).json(loginRequest);
            }
        }
        else {
            res.status(500).json(err);
        }
    });

});

router.post('/getLoginRequest', (req: any, res: any, next: any) => {
    console.log('req.body.containerID: ', req.body.containerID);
    ControlModel.findOne({
        "containerID": req.body.containerID
    }, {}, {}, (err, loginRequest) => {
        if (err) {
            res.status(500).json(err);
            console.log(err);
        }
        else {
            res.status(200).json(loginRequest);
        }
    });
});

module.exports = router;