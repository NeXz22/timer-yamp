import {Server, Socket} from 'socket.io';
import {Server as HttpSever} from 'http';
import {EVENT} from './event.enum';
import {DEFAULT_SESSION_SETTINGS} from './default-session-settings';
import {SessionSettingsModel} from './session-settings.model';

class SocketIoServer extends Server {

    private static io: SocketIoServer;
    private static sessionSettings: Map<string, SessionSettingsModel> = new Map();

    private constructor(httpServer: HttpSever) {
        super(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET']
            }
        });
    }

    public static getInstance(httpServer?: HttpSever): SocketIoServer {
        if (!SocketIoServer.io) {
            SocketIoServer.io = new SocketIoServer(httpServer);
            SocketIoServer.io.initEventListeners();
        }
        return SocketIoServer.io;
    }

    private initEventListeners() {
        this.on('connection', (socket: Socket) => {
            socket.on(EVENT.DISCONNECTING, this.onDisconnecting(socket));
            socket.on(EVENT.DISCONNECT, this.onDisconnect(socket));
            socket.on(EVENT.SESSION_JOINED, this.onSessionJoined(socket));
            socket.on(EVENT.PARTICIPANTS_CHANGED, this.onParticipantsChanged(socket));
            socket.on(EVENT.GOALS_CHANGED, this.onGoalsChanged(socket));
            socket.on(EVENT.START_STOP_COUNTDOWN, this.onStartStopCountdown());
            socket.on(EVENT.RESET_COUNTDOWN, this.onResetCountdown());
            socket.on(EVENT.COUNTDOWN_ENDED, this.onCountdownEnded());
            socket.on(EVENT.TIME_SECONDS_SETTINGS_CHANGED, this.onTimeSecondsSettingsChanged());
            socket.on(EVENT.TIME_MINUTES_SETTINGS_CHANGED, this.onTimeMinutesSettingsChanged());
        });
    }

    private onDisconnecting(socket: Socket) {
        return function () {
            const sessionsToLeave = SocketIoServer.findSessionsToLeave(socket);
            for (const session of sessionsToLeave) {
                SocketIoServer.io.in(session).emit(EVENT.WATCH_CHANGED, SocketIoServer.io.sockets.adapter.rooms.get(session).size - 1);
            }
        }
    }

    private onDisconnect(socket: Socket) {
        return function (reason) {
            SocketIoServer.log(`[${socket.id}] disconnected. Reason: ${reason}. Number of currently connected sockets: ${SocketIoServer.io.engine.clientsCount}`);
        }
    }

    private onSessionJoined(socket: Socket) {
        return function (sessionToJoin) {
            socket.join(sessionToJoin);
            const message = `[${socket.id}] joined the session [${sessionToJoin}]`;
            SocketIoServer.io.in(sessionToJoin).emit(EVENT.TO_ALL_CLIENTS, message);
            SocketIoServer.io.in(sessionToJoin).emit(EVENT.WATCH_CHANGED, SocketIoServer.io.sockets.adapter.rooms.get(sessionToJoin).size);
            SocketIoServer.log(message);

            if (SocketIoServer.sessionSettings.has(sessionToJoin)) {
                if (SocketIoServer.sessionSettings.get(sessionToJoin)) {
                    const existingSessionSettings = {...SocketIoServer.sessionSettings.get(sessionToJoin)};
                    if (SocketIoServer.sessionSettings.get(sessionToJoin).countdownRunning) {
                        existingSessionSettings.countdownLeft -= Date.now() - existingSessionSettings.timeCountdownStarted;
                    }
                    socket.emit(EVENT.SETTINGS_FOR_REQUESTED_SESSION_ALREADY_EXIST, existingSessionSettings)
                }
            } else {
                SocketIoServer.sessionSettings.set(sessionToJoin, {...DEFAULT_SESSION_SETTINGS} as SessionSettingsModel);
            }
        }
    }

    private onParticipantsChanged(socket: Socket) {
        return function (participantsChange) {
            const message = `[${socket.id}] emitted new participants: [${participantsChange.participants}]`;
            SocketIoServer.io.in(participantsChange.sessionId).emit(EVENT.TO_ALL_CLIENTS, message);
            SocketIoServer.log(message);

            SocketIoServer.sessionSettings.get(participantsChange.sessionId).participants = participantsChange.participants;

            socket.broadcast.to(participantsChange.sessionId).emit(EVENT.PARTICIPANTS_UPDATED, participantsChange.participants);
        }
    }

    private onGoalsChanged(socket: Socket) {
        return function (goalsChange) {
            const message = `[${socket.id}] emitted new goals: [${goalsChange.goals}]`;
            SocketIoServer.io.in(goalsChange.sessionId).emit(EVENT.TO_ALL_CLIENTS, message);
            SocketIoServer.log(message);

            SocketIoServer.sessionSettings.get(goalsChange.sessionId).goals = goalsChange.goals;

            socket.broadcast.to(goalsChange.sessionId).emit(EVENT.GOALS_UPDATED, goalsChange.goals);
        }
    }

    private onStartStopCountdown() {
        return function (s) {
            SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning = !SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning;
            SocketIoServer.sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
            if (SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning) {
                SocketIoServer.sessionSettings.get(s.sessionId).timeCountdownStarted = Date.now();
            }
            SocketIoServer.io.in(s.sessionId).emit(EVENT.COUNTDOWN_UPDATE, {
                countdownRunning: SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning,
                countdownLeft: SocketIoServer.sessionSettings.get(s.sessionId).countdownLeft
            });
        }
    }

    private onResetCountdown() {
        return function (s) {
            SocketIoServer.sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
            SocketIoServer.io.in(s.sessionId).emit(EVENT.COUNTDOWN_UPDATE, {
                countdownRunning: SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning,
                countdownLeft: SocketIoServer.sessionSettings.get(s.sessionId).countdownLeft
            });
        }
    }

    private onCountdownEnded() {
        return function (s) {
            SocketIoServer.sessionSettings.get(s.sessionId).countdownRunning = false;
            SocketIoServer.sessionSettings.get(s.sessionId).countdownLeft = s.timeLeft;
        }
    }

    private onTimeSecondsSettingsChanged() {
        return function (s) {
            SocketIoServer.sessionSettings.get(s.sessionId).desiredSeconds = s.desiredSeconds;
            SocketIoServer.io.in(s.sessionId).emit(EVENT.SECONDS_CHANGED, {
                desiredSeconds: s.desiredSeconds
            });
        }
    }

    private onTimeMinutesSettingsChanged() {
        return function (s) {
            SocketIoServer.sessionSettings.get(s.sessionId).desiredMinutes = s.desiredMinutes;
            SocketIoServer.io.in(s.sessionId).emit(EVENT.MINUTES_CHANGED, {
                desiredMinutes: s.desiredMinutes
            });
        }
    }

    private static log(message) {
        console.log(`${new Date().toISOString()}: ${message}.`);
    }

    private static findSessionsToLeave(socket: Socket) {
        const joinedSessions = socket.rooms;
        joinedSessions.delete(socket.id);
        return [...joinedSessions];
    }
}

export default SocketIoServer;