const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

let server;
let io;


startServer(4444);
configureServer();
setupConnection();


app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


function configureServer() {
    io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET']
        }
    });
    log('Allowed CORS-Origins: *');
}

function startServer(port) {
    server = http.createServer(app);
    server.listen(4444, () => {
        logMultiple(['Server started', `Listening on *:${port}`]);
    });
}

function setupConnection() {
    io.on('connection', (socket) => {
        log(`[${socket.id}] connected. Number of currently connected sockets: ${io.engine.clientsCount}`);

        socket.on('disconnect', (reason) => {
            log(`[${socket.id}] disconnected. Reason: ${reason}. Number of currently connected sockets: ${io.engine.clientsCount}`);
        });

        socket.on('join session', (sessionToJoin) => {
            socket.join(sessionToJoin);
            const message = `[${socket.id}] joined the session [${sessionToJoin}]`;
            io.in(sessionToJoin).emit('to all clients', message);
            log(message);
        });
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