let Docker = require('dockerode');
let docker = new Docker({socketPath: '/var/run/docker.sock'});
import {ContainerModel} from "../models/containerModel";

let exec = require('child_process').exec;
let START_PORT = 9000;

let containersArray: any = [];
export let containersData: any = [];


export module ContainerModule {

    export function loadContainers(): void {
        docker.listContainers({all: false}, (err: any, containers: any) => {
            if (containers && containers.length !== 0) {
                ContainerModel.find({}).exec().then((containersData: any) => {

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


    export function inspectContainers() {
        console.log('Start inspectContainers');
        console.log('@containersArray: ', containersArray.length);
        for (let container of containersArray) {
            container.inspect(function (err: any, data: any) {
                containersData.push(data);
            });
        }
    }

    export function initAllContainers(): void {
        console.log('@################# Start All Containers #################');
        ContainerModel.find({}).exec().then((containersData: any) => {
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

    export function startContainer(id: string) {


        let remoteViewPort = (START_PORT + parseInt(id)).toString();
        console.log('remoteViewPort: ', remoteViewPort);


        docker.createContainer({
            Image: 'wemaptech/client-bot:latest',
            Tty: true,
            Cmd: ['/bin/bash'],
            'Dns': ['8.8.8.8', '8.8.4.4'],
            HostConfig: {Privileged: true, PortBindings: {'6080/tcp': [{HostPort: remoteViewPort}]}}
        }, (err: any, container: any) => {
            container.start({}, function (err: any, data: any) {
                runExec(container, id);
            });
        });

        function runExec(container: any, id: any) {
            console.log('runExec ID: ', id);
            let options = {
                Cmd: ['sh', '-c', 'cd /social-robot-new && git reset --hard && git pull && /social-robot-new/init.sh && supervisord &'],
                Env: ['CONTAINER=' + id],

                AttachStdout: true,
                AttachStderr: true,
                Restart: ['always'],
                Volumes: ['social-robot-new']
            };

            container.exec(options, (err: any, exec: any) => {
                if (err) {
                    console.log('Container exec Error: ', err);
                    return;
                }
                exec.start(function (err: any, stream: any) {
                    if (err) {
                        console.log('Container start Error: ', err);
                        return;
                    }
                    container.modem.demuxStream(stream, process.stdout, process.stderr);
                    exec.inspect(function (err: any, data: any) {
                        if (err) return;
                    });
                });
            });
        }
    }

    export function stopContainer(id: any) {
        docker.getContainer(id).stop();
    }

    export function restartContainer(startID: any, stopID: any) {
        console.log('Restart Container with id: ', startID);
        stopContainer(stopID);
        setTimeout(() => {
            console.log('Start Container: ', startID);
            startContainer(startID);
        }, 5000);
    }

    export function pauseContainer(id: any, state: boolean) {

        ContainerModel.findOne({id: id}).exec().then((container: any) => {
            console.log('pause containers: ', container);

            container.paused = state;
            container.save();

        }).catch(err => console.log(err));
    }

    export function stopAllContainers() {

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

}

