"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let Docker = require('dockerode');
let docker = new Docker({ socketPath: '/var/run/docker.sock' });
const containerModel_1 = require("../models/containerModel");
let exec = require('child_process').exec;
let START_PORT = 9000;
let containersArray = [];
exports.containersData = [];
var ContainerModule;
(function (ContainerModule) {
    function loadContainers() {
        docker.listContainers({ all: false }, (err, containers) => {
            if (containers && containers.length !== 0) {
                containerModel_1.ContainerModel.find({}).exec().then((containersData) => {
                    for (let containerData of containersData) {
                        if (containerData.length !== 0) {
                            let container = docker.getContainer(containerData.hostname);
                            containersArray.push(container);
                        }
                    }
                    inspectContainers();
                }).catch(err => console.log(err));
            }
            else {
                console.log('No Containers running START them now !!!');
                stopAllContainers();
            }
        });
    }
    ContainerModule.loadContainers = loadContainers;
    function inspectContainers() {
        console.log('Start inspectContainers');
        console.log('@containersArray: ', containersArray.length);
        for (let container of containersArray) {
            container.inspect(function (err, data) {
                exports.containersData.push(data);
            });
        }
    }
    ContainerModule.inspectContainers = inspectContainers;
    function initAllContainers() {
        console.log('@################# Start All Containers #################');
        containerModel_1.ContainerModel.find({}).exec().then((containersData) => {
            console.log('containers: ', containersData);
            for (let i = 0; i < containersData.length; i++) {
                console.log('Start Container with ID: ', containersData[i].id);
                if (containersData[i].hostname !== '000000000000' && !containersData[i].paused) {
                    setTimeout(() => {
                        startContainer(containersData[i].id);
                    }, 6000 * i);
                }
            }
        }).catch(err => console.log(err));
        setTimeout(() => {
            loadContainers();
        }, 10000);
    }
    ContainerModule.initAllContainers = initAllContainers;
    function startContainer(id) {
        let remoteViewPort = (START_PORT + parseInt(id)).toString();
        console.log('remoteViewPort: ', remoteViewPort);
        docker.createContainer({
            Image: 'wemaptech/client-bot:latest',
            Tty: true,
            Cmd: ['/bin/bash'],
            'Dns': ['8.8.8.8', '8.8.4.4'],
            HostConfig: { Privileged: true, PortBindings: { '6080/tcp': [{ HostPort: remoteViewPort }] } }
        }, (err, container) => {
            container.start({}, function (err, data) {
                runExec(container, id);
            });
        });
        function runExec(container, id) {
            console.log('runExec ID: ', id);
            let options = {
                Cmd: ['sh', '-c', 'cd /social-robot-new && git reset --hard && git pull && /social-robot-new/init.sh && supervisord &'],
                Env: ['CONTAINER=' + id],
                AttachStdout: true,
                AttachStderr: true,
                Restart: ['always'],
                Volumes: ['social-robot-new']
            };
            container.exec(options, (err, exec) => {
                if (err) {
                    console.log('Container exec Error: ', err);
                    return;
                }
                exec.start(function (err, stream) {
                    if (err) {
                        console.log('Container start Error: ', err);
                        return;
                    }
                    container.modem.demuxStream(stream, process.stdout, process.stderr);
                    exec.inspect(function (err, data) {
                        if (err)
                            return;
                    });
                });
            });
        }
    }
    ContainerModule.startContainer = startContainer;
    function stopContainer(id) {
        docker.getContainer(id).stop();
    }
    ContainerModule.stopContainer = stopContainer;
    function restartContainer(startID, stopID) {
        console.log('Restart Container with id: ', startID);
        stopContainer(stopID);
        setTimeout(() => {
            console.log('Start Container: ', startID);
            startContainer(startID);
        }, 5000);
    }
    ContainerModule.restartContainer = restartContainer;
    function pauseContainer(id, state) {
        containerModel_1.ContainerModel.findOne({ id: id }).exec().then((container) => {
            console.log('pause containers: ', container);
            container.paused = state;
            container.save();
        }).catch(err => console.log(err));
    }
    ContainerModule.pauseContainer = pauseContainer;
    function stopAllContainers() {
        setTimeout(() => {
            exec('docker stop $(docker ps -a -q) &');
            console.log('docker stop');
            setTimeout(() => {
                exec('docker rm $(docker ps -a -q) &');
                console.log('docker rm');
                setTimeout(() => {
                    exec('docker volume rm $(docker volume ls -qf dangling=true) &');
                    console.log('docker volume rm');
                    setTimeout(() => {
                        initAllContainers();
                    }, 15000);
                }, 15000);
            }, 15000);
        }, 15000);
    }
    ContainerModule.stopAllContainers = stopAllContainers;
})(ContainerModule = exports.ContainerModule || (exports.ContainerModule = {}));
//# sourceMappingURL=ContainerModule.js.map