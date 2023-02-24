"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongoose = require("mongoose");
const userModel_1 = require("../../models/userModel");
const settings_1 = require("../../../settings");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.post('/login', (req, res, next) => {
    userModel_1.UserModel.find({ email: req.body.email })
        .then((user) => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'Auth failed'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            if (result) {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, settings_1.SETTINGS.JWT_KEY, {
                    /*algorithm: 'RS256',*/
                    expiresIn: "999d",
                });
                return res.status(200).json({
                    email: user[0].email,
                    id: user[0]._id,
                    message: 'Auth successful',
                    idToken: token,
                    expiresIn: '8633600' /*TODO fix this*/
                });
            }
            return res.status(401).json({
                message: 'Auth failed'
            });
        });
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.post('/signup', (req, res, next) => {
    userModel_1.UserModel.find({ email: req.body.email })
        .exec()
        .then(user => {
        if (user.length >= 1) {
            res.status(409).json({
                message: 'Mail Exists'
            });
        }
        else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    res.status(500).json({
                        error: err
                    });
                }
                else {
                    const user = new userModel_1.UserModel({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user
                        .save()
                        .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'User created'
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
        }
    })
        .catch();
});
router.delete('/:userId', (req, res, next) => {
    userModel_1.UserModel.remove({
        _id: req.params.userId
    })
        .exec()
        .then(result => {
        res.status(200).json({
            message: 'User deleted',
            result
        });
    })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});
module.exports = router;
//# sourceMappingURL=userRoute.js.map