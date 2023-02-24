"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
let port = 3334;
exports.testServer = false;
if (process.argv.slice(2)[0] == 'd') {
    port = 3333;
    exports.testServer = true;
}
const app = require('./app');
const server = http.createServer(app);
console.log('Server running on port : ', port);
server.listen(port);
//# sourceMappingURL=server.js.map