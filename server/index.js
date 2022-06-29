const express = require('express');
const app = express();
const http = require('http');

let server;


startServer(4444);


app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


function startServer(port) {
    server = http.createServer(app);
    server.listen(4444, () => {
        logMultiple(['server started', `listening on *:${port}`]);
    });
}

function stopServer() {
    server.unref();
}

function log(message) {
    console.log(`${new Date().toISOString()}: ${message}.`);
}

function logMultiple(messages) {
    for (const message of messages) {
        console.log(`${new Date().toISOString()}: ${message}.`);
    }
}


module.exports = server
module.exports.stopServer = stopServer;