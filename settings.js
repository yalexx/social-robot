"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let HOSTNAME = process.env.HOSTNAME;
console.log('@User is: ', HOSTNAME);
if (HOSTNAME === '000000000000') {
    exports.port = 3334;
    console.log('@Dev environment client port is: ', exports.port);
}
else {
    exports.port = 3334;
    console.log('@Production environment client port is: ', exports.port);
}
const pass = 'wemapbossA!!';
const testDb = 'social-robot-db';
const db = 'social-robot-db';
exports.SETTINGS = {
    PORT: exports.port,
    SERVER_API: `http://social-robots.ddns.net:` + exports.port,
    DB_URL: `mongodb://social-robots.ddns.net:27017/${db}`,
    TEST_DB_URL: `mongodb://social-robots.ddns.net:27017/${testDb}`,
    JWT_KEY: '31051992menA!'
};
//mongodb://controlwemaptech:<PASSWORD>@social-robot-db-shard-00-00-m2ftl.gcp.mongodb.net:27017,social-robot-db-shard-00-01-m2ftl.gcp.mongodb.net:27017,social-robot-db-shard-00-02-m2ftl.gcp.mongodb.net:27017/test?ssl=true&replicaSet=social-robot-db-shard-0&authSource=admin&retryWrites=true
