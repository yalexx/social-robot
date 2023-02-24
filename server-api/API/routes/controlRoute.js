"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongoose = require("mongoose");
const controlModel_1 = require("../../models/controlModel");
const router = express.Router();
let _ = require('lodash');
router.post('/setLoginRequest', (req, res, next) => {
    controlModel_1.ControlModel.findOne({ containerID: req.body.containerID }, function (err, loginRequest) {
        if (!err) {
            if (loginRequest) {
                console.log('remove loginRequest: ', loginRequest);
                loginRequest.remove();
            }
            const control = new controlModel_1.ControlModel({
                _id: new mongoose.Types.ObjectId(),
                SIDId: req.body.SIDId,
                containerID: req.body.containerID
            });
            control.save().then((result) => {
                console.log(result);
                res.status(201).json({
                    message: 'Control Login Request Created'
                });
            })
                .catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }
    });
});
router.post('/removeLoginRequest', (req, res, next) => {
    controlModel_1.ControlModel.findOne({ containerID: req.body.containerID }, function (err, loginRequest) {
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
router.post('/getLoginRequest', (req, res, next) => {
    console.log('req.body.containerID: ', req.body.containerID);
    controlModel_1.ControlModel.findOne({
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
//# sourceMappingURL=controlRoute.js.map