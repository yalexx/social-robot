import * as express from "express";
import {ContainerModel} from "../../models/containerModel";
import * as child_process from 'child_process';
import * as fs from "fs";
import {ContainerModule, containersData} from "../../modules/ContainerModule";
import inspectContainers = ContainerModule.inspectContainers;
import stopAllContainers = ContainerModule.stopAllContainers;
let exec = require('child_process').exec;
const router = express.Router();
let _ = require('lodash');
let Docker = require('dockerode');
let docker = new Docker({socketPath: '/var/run/docker.sock'});
const checkAuth = require('../middleware/check-auth');

router.get('/', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    })
});

router.get('/:Id', (req: any, res: any, next: any) => {

    ContainerModel.findOne({
        id: req.params.Id
    }).exec().then((container: any) => {

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

router.post('/start', (req: any, res: any, next: any) => {

    console.log('Start Container');
    ContainerModule.initAllContainers();
    res.status(201).json({
        message: 'Container Started!',
    });
});

router.post('/startContainer', (req: any, res: any, next: any) => {

    console.log('Start Single Container: ', req.body.id);

    ContainerModule.startContainer(req.body.id);

    res.status(201).json({
        message: 'Container Started: ' + req.body.id,
    });

});

router.post('/stopContainer', (req: any, res: any, next: any) => {
    console.log('Stop Single Container: ', req.body.id);
    ContainerModule.stopContainer(req.body.id);
    res.status(201).json({
        message: 'Container Stopped: ' + req.body.id,
    });
});

router.post('/restartContainer', (req: any, res: any, next: any) => {
    console.log('Restart Single Container: ', req.body.id);
    ContainerModule.restartContainer(req.body.startId, req.body.stopId);
    res.status(201).json({
        message: 'Container Restarted: ' + req.body.id,
    });
});

router.post('/pauseContainer', (req: any, res: any, next: any) => {

    console.log('Pause Single Container: ', req.body.id, ' ', req.body.paused);

    ContainerModule.pauseContainer(req.body.id, req.body.paused);

    res.status(201).json({
        message: 'Container Paused: ' + req.body.id,
    });

});

router.post('/stopAll', (req: any, res: any, next: any) => {

    stopAllContainers();

    res.status(201).json({
        message: 'Stop All Containers: '
    });
});

router.post('/list', checkAuth, (req: any, res: any, next: any) => {
    let newDataArray: any = [];

    //https://github.com/apocas/dockerode/blob/master/examples/listContainers.js
    ContainerModel.find({}).exec().then((containerTasks: any) => {

        _.map(containerTasks, orderContainers);

        function orderContainers(container: any) {

            let newContainer = docker.getContainer(container.hostname);
            newContainer.inspect(function (err: any, data: any) {

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
                containers: _.sortBy(newDataArray, (obj: any) => {
                    return parseInt(obj.container.id);
                })
            });
        }, 300);


    }).catch(err => console.log(err));

});

router.post('/listTasks', (req: any, res: any, next: any) => {

    ContainerModel.find({}).exec().then((containerTasks: any) => {

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

router.post('/createOrUpdate', (req: any, res: any, next: any) => {
    ContainerModel.findOne({id: req.body.id}).exec().then((container: any) => {

        if (container === null) {
            const newContainer = new ContainerModel(req.body);

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
            ContainerModel.update({_id: container._id}, req.body, {upsert: true, setDefaultsOnInsert: true}, () => {
                res.status(201).json({
                    message: 'Container updated',
                    data: req.body
                });
            });
        }
    });

});

router.delete('/:taskId', (req: any, res: any, next: any) => {
    res.status(200).json({
        message: 'Deleted task!'
    })
});

module.exports = router;