"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const containerModel_1 = require("../../models/containerModel");
const ContainerModule_1 = require("../../modules/ContainerModule");
var stopAllContainers = ContainerModule_1.ContainerModule.stopAllContainers;
let exec = require('child_process').exec;
const router = express.Router();
let _ = require('lodash');
let Docker = require('dockerode');
let docker = new Docker({ socketPath: '/var/run/docker.sock' });
const checkAuth = require('../middleware/check-auth');
router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});
router.get('/:Id', (req, res, next) => {
    containerModel_1.ContainerModel.findOne({
        id: req.params.Id
    }).exec().then((container) => {
        if (container === null) {
            res.status(500).json({
                data: null,
                error: 'Container not found'
            });
        }
        else {
            res.status(200).json({
                data: container
            });
        }
    }).catch(err => console.log(err));
});
router.post('/start', (req, res, next) => {
    console.log('Start Container');
    ContainerModule_1.ContainerModule.initAllContainers();
    res.status(201).json({
        message: 'Container Started!',
    });
});
router.post('/startContainer', (req, res, next) => {
    console.log('Start Single Container: ', req.body.id);
    ContainerModule_1.ContainerModule.startContainer(req.body.id);
    res.status(201).json({
        message: 'Container Started: ' + req.body.id,
    });
});
router.post('/stopContainer', (req, res, next) => {
    console.log('Stop Single Container: ', req.body.id);
    ContainerModule_1.ContainerModule.stopContainer(req.body.id);
    res.status(201).json({
        message: 'Container Stopped: ' + req.body.id,
    });
});
router.post('/restartContainer', (req, res, next) => {
    console.log('Restart Single Container: ', req.body.id);
    ContainerModule_1.ContainerModule.restartContainer(req.body.startId, req.body.stopId);
    res.status(201).json({
        message: 'Container Restarted: ' + req.body.id,
    });
});
router.post('/pauseContainer', (req, res, next) => {
    console.log('Pause Single Container: ', req.body.id, ' ', req.body.paused);
    ContainerModule_1.ContainerModule.pauseContainer(req.body.id, req.body.paused);
    res.status(201).json({
        message: 'Container Paused: ' + req.body.id,
    });
});
router.post('/stopAll', (req, res, next) => {
    stopAllContainers();
    res.status(201).json({
        message: 'Stop All Containers: '
    });
});
router.post('/list', checkAuth, (req, res, next) => {
    let newDataArray = [];
    //https://github.com/apocas/dockerode/blob/master/examples/listContainers.js
    containerModel_1.ContainerModel.find({}).exec().then((containerTasks) => {
        _.map(containerTasks, orderContainers);
        function orderContainers(container) {
            let newContainer = docker.getContainer(container.hostname);
            newContainer.inspect(function (err, data) {
                container.id = parseInt(container.id);
                newDataArray.push({
                    container,
                    data
                });
            });
        }
        setTimeout(() => {
            res.status(201).json({
                runningContainers: containerTasks.length,
                message: 'Container Listed',
                containers: _.sortBy(newDataArray, (obj) => {
                    return parseInt(obj.container.id);
                })
            });
        }, 300);
    }).catch(err => console.log(err));
});
router.post('/listTasks', (req, res, next) => {
    containerModel_1.ContainerModel.find({}).exec().then((containerTasks) => {
        if (containerTasks === null) {
            res.status(500).json({
                data: null,
                error: 'Container tasks not found'
            });
        }
        else {
            res.status(200).json(containerTasks);
        }
    }).catch(err => console.log(err));
});
router.post('/createOrUpdate', (req, res, next) => {
    containerModel_1.ContainerModel.findOne({ id: req.body.id }).exec().then((container) => {
        if (container === null) {
            const newContainer = new containerModel_1.ContainerModel(req.body);
            newContainer.save().then((result) => {
                console.log(result);
                res.status(201).json({
                    message: 'Container Created!',
                    data: newContainer
                });
            }).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });
            });
        }
        else {
            containerModel_1.ContainerModel.update({ _id: container._id }, req.body, { upsert: true, setDefaultsOnInsert: true }, () => {
                res.status(201).json({
                    message: 'Container updated',
                    data: req.body
                });
            });
        }
    });
});
router.delete('/:taskId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted task!'
    });
});
module.exports = router;
//# sourceMappingURL=containersRoute.js.map