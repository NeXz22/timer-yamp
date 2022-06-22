const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

server.listen(4444, () => {
    console.log('listening on *:4444');
});

function stopServer() {
    server.unref();
}

module.exports = server
module.exports.stopServer = stopServer;