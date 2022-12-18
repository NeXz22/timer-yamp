import * as express from 'express';
import {Server, createServer} from 'http';
import {Server as SocketServer, Socket} from 'socket.io';
import {EVENT} from './event.enum';
import {DEFAULT_SESSION_SETTINGS} from './default-session-settings';
import {SessionSettingsModel} from './session-settings.model';

const app = express();
let server: Server;
let io: SocketServer;
let sessionSettings: Map<string, SessionSettingsModel> = new Map();


(async () => {
    await startServer(4444);
    configureServer();
    initEventListeners();
})();


app.get('/', (_req, res) => {
    res.send('<h1>Hello world</h1>');
});


function configureServer() {
    io = new SocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET']
        }
    });
    log('Allowed CORS-Origins: *');
}

async function startServer(port: number) {
    server = createServer(app);
    await server.listen(4444);
    logMultiple(['Server started', `Listening on *:${port}`]);
}

function initEventListeners() {
    io.on('connection', (socket: Socket) => {
        log(`[${socket.id}] connected. Number of currently connected sockets: ${io.engine.clientsCount}`);
        socket.on(EVENT.DISCONNECTING, onDisconnecting(socket));
        socket.on(EVENT.DISCONNECT, onDisconnect(socket));
        socket.on(EVENT.SESSION_JOINED, onSessionJoined(socket));
        socket.on(EVENT.PARTICIPANTS_CHANGED, onParticipantsChanged(socket));
        socket.on(EVENT.GOALS_CHANGED, onGoalsChanged(socket));
        socket.on(EVENT.START_STOP_COUNTDOWN, onStartStopCountdown());
        socket.on(EVENT.RESET_COUNTDOWN, onResetCountdown());
        socket.on(EVENT.COUNTDOWN_ENDED, onCountdownEnded());
        socket.on(EVENT.TIME_SECONDS_SETTINGS_CHANGED, onTimeSecondsSettingsChanged());
        socket.on(EVENT.TIME_MINUTES_SETTINGS_CHANGED, onTimeMinutesSettingsChanged());
    });
}

function onDisconnecting(socket: Socket) {
    return function () {
        const sessionsToLeave = findSessionsToLeave(socket);
        for (const session of sessionsToLeave) {
            io.in(session).emit(EVENT.WATCH_CHANGED, io.sockets.adapter.rooms.get(session).size - 1);
        }
    }
}

function onDisconnect(socket: Socket) {
    return function (reason) {
        log(`[${socket.id}] disconnected. Reason: ${reason}. Number of currently connected sockets: ${io.engine.clientsCount}`);
    }
}

function onSessionJoined(socket: Socket) {
    return function (sessionToJoin) {
        socket.join(sessionToJoin);
        const message = `[${socket.id}] joined the session [${sessionToJoin}]`;
        io.in(sessionToJoin).emit(EVENT.TO_ALL_CLIENTS, message);
        io.in(sessionToJoin).emit(EVENT.WATCH_CHANGED, io.sockets.adapter.rooms.get(sessionToJoin).size);
        log(message);

        if (sessionSettings.has(sessionToJoin)) {
            if (sessionSettings.get(sessionToJoin)) {
                const existingSessionSettings = {...sessionSettings.get(sessionToJoin)};
                if (sessionSettings.get(sessionToJoin).countdownRunning) {
                    existingSessionSettings.countdownLeft -= Date.now() - existingSessionSettings.timeCountdownStarted;
                }
                socket.emit(EVENT.SETTINGS_FOR_REQUESTED_SESSION_ALREADY_EXIST, existingSessionSettings)
            }
        } else {
            sessionSettings.set(sessionToJoin, {...DEFAULT_SESSION_SETTINGS} as SessionSettingsModel);
        }
    }
}

function onParticipantsChanged(socket: Socket) {
    return function (participantsChange) {
        const message = `[${socket.id}] emitted new participants: [${participantsChange.participants}]`;
        io.in(participantsChange.sessionId).emit(EVENT.TO_ALL_CLIENTS, message);
        log(message);

        sessionSettings.get(participantsChange.sessionId).participants = participantsChange.participants;

        socket.broadcast.to(participantsChange.sessionId).emit(EVENT.PARTICIPANTS_UPDATED, participantsChange.participants);
    }
}

function onGoalsChanged(socket: Socket) {
    return function (goalsChange) {
        const message = `[${socket.id}] emitted new goals: [${goalsChange.goals}]`;
        io.in(goalsChange.sessionId).emit(EVENT.TO_ALL_CLIENTS, message);
        log(message);

        sessionSettings.get(goalsChange.sessionId).goals = goalsChange.goals;

        socket.broadcast.to(goalsChange.sessionId).emit(EVENT.GOALS_UPDATED, goalsChange.goals);
    }
}

function onStartStopCountdown() {
    return function (s) {
        sessionSettings.get(s.sessionId).countdownRunning = !sessionSettings.get(s.sessionId).countdownRunning;
        sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
        if (sessionSettings.get(s.sessionId).countdownRunning) {
            sessionSettings.get(s.sessionId).timeCountdownStarted = Date.now();
        }
        io.in(s.sessionId).emit(EVENT.COUNTDOWN_UPDATE, {
            countdownRunning: sessionSettings.get(s.sessionId).countdownRunning,
            countdownLeft: sessionSettings.get(s.sessionId).countdownLeft
        });
    }
}

function onResetCountdown() {
    return function (s) {
        sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
        io.in(s.sessionId).emit(EVENT.COUNTDOWN_UPDATE, {
            countdownRunning: sessionSettings.get(s.sessionId).countdownRunning,
            countdownLeft: sessionSettings.get(s.sessionId).countdownLeft
        });
    }
}

function onCountdownEnded() {
    return function (s) {
        sessionSettings.get(s.sessionId).countdownRunning = false;
        sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
    }
}

function onTimeSecondsSettingsChanged() {
    return function (s) {
        sessionSettings.get(s.sessionId).desiredSeconds = s.desiredSeconds;
        io.in(s.sessionId).emit(EVENT.SECONDS_CHANGED, {
            desiredSeconds: s.desiredSeconds
        });
    }
}

function onTimeMinutesSettingsChanged() {
    return function (s) {
        sessionSettings.get(s.sessionId).desiredMinutes = s.desiredMinutes;
        io.in(s.sessionId).emit(EVENT.MINUTES_CHANGED, {
            desiredMinutes: s.desiredMinutes
        });
    }
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

function findSessionsToLeave(socket: Socket) {
    const joinedSessions = socket.rooms;
    joinedSessions.delete(socket.id);
    return [...joinedSessions];
}


module.exports = server
module.exports.stopServer = stopServer;
module.exports.findSessionsToLeave = findSessionsToLeave;