import * as http from "http";

let port = 3334;
export let testServer = false;
if (process.argv.slice(2)[0] == 'd') {
    port = 3333;
    testServer = true;
}

const app = require('./app');
const server = http.createServer(app);
console.log('Server running on port : ', port);
server.listen(port);