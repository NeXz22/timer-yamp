import {Server, Socket} from 'socket.io';
import {Server as HttpSever} from 'http';
import {EVENT} from './event.enum';
import {SessionSettingsModel} from './session-settings.model';
import {NewGoalSubmit} from './model/new-goal-submit.model';
import {DeleteGoalSubmit} from './model/delete-goal-submit.model';
import {ArraySortingSubmit} from './model/array-sorting-submit.model';
import {NewParticipantSubmit} from './model/new-participant-submit.model';
import {DeleteParticipantSubmit} from './model/delete-participant-submit.model';
import {NewRoleSubmit} from './model/new-role-submit.model';
import {DeleteRoleSubmit} from './model/delete-role-submit.model';
import {GoalCompletedSubmit} from './model/goal-completed-submit.model';

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
        this.on(EVENT.CONNECTION, (socket: Socket) => {
            socket.on(EVENT.DISCONNECTING, this.onDisconnecting(socket));
            socket.on(EVENT.DISCONNECT, this.onDisconnect(socket));
            socket.on(EVENT.SESSION_JOINED, this.onSessionJoined(socket));
            socket.on(EVENT.PARTICIPANT_SORTING_CHANGED, this.onParticipantsSortingChanged());
            socket.on(EVENT.ROLES_SORTING_CHANGED, this.onRolesSortingChanged());
            socket.on(EVENT.NEW_PARTICIPANT_SUBMITTED, this.onNewParticipantSubmitted());
            socket.on(EVENT.NEW_ROLE_SUBMITTED, this.onNewRoleSubmitted());
            socket.on(EVENT.ROLE_DELETED, this.onRoleDeleted());
            socket.on(EVENT.PARTICIPANT_DELETED, this.onParticipantDeleted());
            socket.on(EVENT.GOALS_SORTING_CHANGED, this.onGoalsSortingChanged());
            socket.on(EVENT.NEW_GOAL_SUBMITTED, this.onNewGoalSubmitted());
            socket.on(EVENT.GOAL_DELETED, this.onGoalDeleted());
            socket.on(EVENT.GOAL_COMPLETED, this.onGoalCompleted());
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
                    socket.emit(EVENT.SETTINGS_FOR_REQUESTED_SESSION_ALREADY_EXIST, existingSessionSettings);
                }
            } else {
                const defaultSettings = {
                    participants: [],
                    goals: [],
                    roles: ['driver', 'navigator'],
                    countdownRunning: false,
                    countdownLeft: 900000,
                    timeCountdownStarted: 0,
                    desiredSeconds: 0,
                    desiredMinutes: 900000,
                };
                SocketIoServer.sessionSettings.set(sessionToJoin, defaultSettings);
                socket.emit(EVENT.SETTINGS_FOR_REQUESTED_SESSION_ALREADY_EXIST, defaultSettings);
            }
        }
    }

    private onNewRoleSubmitted() {
        return function (settingsUpdate: NewRoleSubmit) {
            const sessionRoles = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).roles;
            sessionRoles.push(settingsUpdate.newRole);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.ROLES_CHANGED, sessionRoles);
        }
    }

    private onRoleDeleted() {
        return function (settingsUpdate: DeleteRoleSubmit) {
            const sessionRoles = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).roles;
            const updatedRoles = sessionRoles.filter(role => role !== settingsUpdate.roleToDelete);
            SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).roles = updatedRoles;
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.ROLES_CHANGED, updatedRoles);
        }
    }

    private onRolesSortingChanged() {
        return function (settingsUpdate: ArraySortingSubmit) {
            SocketIoServer.moveElementInArray(SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).roles, settingsUpdate.indices.previousIndex, settingsUpdate.indices.newIndex);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.ROLES_CHANGED, SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).roles);
        }
    }

    private onParticipantsSortingChanged() {
        return function (settingsUpdate: ArraySortingSubmit) {
            SocketIoServer.moveElementInArray(SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).participants, settingsUpdate.indices.previousIndex, settingsUpdate.indices.newIndex);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.PARTICIPANTS_UPDATED, SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).participants);
        }
    }

    private onNewParticipantSubmitted() {
        return function (settingsUpdate: NewParticipantSubmit) {
            const sessionParticipants = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).participants;
            sessionParticipants.push(settingsUpdate.newParticipant);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.PARTICIPANTS_UPDATED, sessionParticipants);
        }
    }

    private onParticipantDeleted() {
        return function (settingsUpdate: DeleteParticipantSubmit) {
            const sessionParticipants = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).participants;
            const updatedParticipants = sessionParticipants.filter(participant => participant !== settingsUpdate.participantToDelete);
            SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).participants = updatedParticipants;
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.PARTICIPANTS_UPDATED, updatedParticipants);
        }
    }

    private onGoalsSortingChanged() {
        return function (settingsUpdate: ArraySortingSubmit) {
            SocketIoServer.moveElementInArray(SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals, settingsUpdate.indices.previousIndex, settingsUpdate.indices.newIndex);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.GOALS_UPDATED, SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals);
        }
    }

    private onNewGoalSubmitted() {
        return function (settingsUpdate: NewGoalSubmit) {
            const sessionGoals = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals;
            const newGoal = {name: settingsUpdate.newGoal, completed: false};
            sessionGoals.push(newGoal);
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.GOALS_UPDATED, sessionGoals);
        }
    }

    private onGoalDeleted() {
        return function (settingsUpdate: DeleteGoalSubmit) {
            const sessionGoals = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals;
            const updatedGoals = sessionGoals.filter(goal => goal.name !== settingsUpdate.goalToDelete);
            SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals = updatedGoals;
            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.GOALS_UPDATED, updatedGoals);
        }
    }

    private onGoalCompleted() {
        return function (settingsUpdate: GoalCompletedSubmit) {
            const sessionGoals = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).goals;
            const completedGoal = sessionGoals.find(goal => goal.name === settingsUpdate.goalToComplete);
            if (completedGoal) {
                completedGoal.completed = !completedGoal.completed;
                SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.GOALS_UPDATED, sessionGoals);
            }
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

    private static moveElementInArray(array: {name: string, completed: boolean}[] | any[], old_index: number, new_index: number): void {
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    };
}

export default SocketIoServer;