const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');

let server;
let io;
let sessionSettings = new Map();
const defaultSessionSettings = {
    participants: [],
    goals: [],
};


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

        socket.on('disconnecting', () => {
            const sessionsToLeave = findSessionsToLeave(socket);
            for (const session of sessionsToLeave) {
                io.in(session).emit('watch changed', io.sockets.adapter.rooms.get(session).size - 1);
            }
        });

        socket.on('disconnect', (reason) => {
            log(`[${socket.id}] disconnected. Reason: ${reason}. Number of currently connected sockets: ${io.engine.clientsCount}`);
        });

        socket.on('join session', (sessionToJoin) => {
            socket.join(sessionToJoin);
            const message = `[${socket.id}] joined the session [${sessionToJoin}]`;
            io.in(sessionToJoin).emit('to all clients', message);
            io.in(sessionToJoin).emit('watch changed', io.sockets.adapter.rooms.get(sessionToJoin).size);
            log(message);

            if (sessionSettings.has(sessionToJoin)) {
                if (sessionSettings.get(sessionToJoin)) {
                    socket.emit('settings for requested session already exist', sessionSettings.get(sessionToJoin))
                }
            } else {
                sessionSettings.set(sessionToJoin, {...defaultSessionSettings});
            }
        });

        socket.on('participants changed', (participantsChange) => {
            const message = `[${socket.id}] emitted new participants: [${participantsChange.participants}]`;
            io.in(participantsChange.sessionId).emit('to all clients', message);
            log(message);

            sessionSettings.get(participantsChange.sessionId).participants = participantsChange.participants;

            socket.broadcast.to(participantsChange.sessionId).emit('participants updated', participantsChange.participants);
        });

        socket.on('goals changed', (goalsChange) => {
            const message = `[${socket.id}] emitted new goals: [${goalsChange.goals}]`;
            io.in(goalsChange.sessionId).emit('to all clients', message);
            log(message);

            sessionSettings.get(goalsChange.sessionId).goals = goalsChange.goals;

            socket.broadcast.to(goalsChange.sessionId).emit('goals updated', goalsChange.goals);
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

function findSessionsToLeave(socket) {
    const joinedSessions = socket.adapter.socketRooms(socket.id);
    joinedSessions.delete(socket.id);
    return [...joinedSessions];
}


module.exports = server
module.exports.stopServer = stopServer;
module.exports.findSessionsToLeave = findSessionsToLeave;