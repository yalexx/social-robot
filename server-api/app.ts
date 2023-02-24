import * as express from "express";
import {initCron} from "./cron/cron";
import {SETTINGS} from "../settings";
import {ContainerModule} from "./modules/ContainerModule";
import loadContainers = ContainerModule.loadContainers;
import * as fs from "fs";
import {testServer} from './server';
import {SidModel} from "./models/sidModel";
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRoutes = require('./API/routes/productsRoute');
const orderRoutes = require('./API/routes/ordersRoute');
const taskRoutes = require('./API/routes/tasksRoute');
const socialBotsRoutes = require('./API/routes/socialBotsRoute');
const locationRoutes = require('./API/routes/locationRoute');
const removedSidsRoutes = require('./API/routes/removedSidsRoute');
const sidsRoutes = require('./API/routes/sidsRoute');
const fbSidsRoutes = require('./API/routes/fbSidsRoute');
const containersRoutes = require('./API/routes/containersRoute');
const statsRoutes = require('./API/routes/statsRoute');
const userRoutes = require('./API/routes/userRoute');
const imagesRoutes = require('./API/routes/imagesRoute');
const controlRoutes = require('./API/routes/controlRoute');

//Create error log Stream
let errorLogStream = fs.createWriteStream(__dirname + '/logs/error.log', {flags: 'a'});

process.on('uncaughtException', (error) => {
    console.log('UncaughtException:', error.stack);
    errorLogStream.write(new Date() + '\n' + error.stack + '\n\n');
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

mongoose.connect(testServer ? SETTINGS.TEST_DB_URL : SETTINGS.DB_URL, {
    useMongoClient: true,
}).then(() => console.log('DB connection successful')).catch((err: any) => console.error(err));

SidModel.count({"isVerified": true}, (err, c) => {
    console.log('Sids Count is ' + c);
});

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Routes
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/tasks', taskRoutes);
app.use('/socialBots', socialBotsRoutes);
app.use('/location', locationRoutes);
app.use('/removedSids', removedSidsRoutes);
app.use('/sids', sidsRoutes);
app.use('/fbSids', fbSidsRoutes);
app.use('/containers', containersRoutes);
app.use('/stats', statsRoutes);
app.use('/user', userRoutes);
app.use('/images', imagesRoutes);
app.use('/control', controlRoutes);

// Error handling
app.use((req, res, next) => {
    const error = new Error('Route not found');
    res.status(404);
    next(error);
});

app.use((error: any, req: any, res: any, next: any) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

initCron();
loadContainers();

module.exports = app;