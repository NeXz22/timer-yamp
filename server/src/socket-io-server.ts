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
import {Observable, timer} from 'rxjs';
import * as _ from 'lodash';

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
                    let existingSessionSettings = {...SocketIoServer.sessionSettings.get(sessionToJoin)};
                    existingSessionSettings = _.omit(existingSessionSettings, ['timerSubscription', 'timerObservable']);
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
        return function (settingsUpdate) {
            const sessionSettings = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId);

            sessionSettings.countdownRunning = !sessionSettings.countdownRunning;
            sessionSettings.countdownLeft = settingsUpdate.timeLeft;
            if (sessionSettings.countdownRunning) {
                sessionSettings.timeCountdownStarted = Date.now();
            }

            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.COUNTDOWN_UPDATE, {
                countdownRunning: sessionSettings.countdownRunning,
                countdownLeft: sessionSettings.countdownLeft
            });


            if (sessionSettings.countdownRunning) {
                console.log('timer started!');
                const timerObservable = SocketIoServer.createTimer(sessionSettings.countdownLeft);
                sessionSettings.timerObservable = timerObservable;

                sessionSettings.timerSubscription = timerObservable.subscribe({
                    next: () => {
                        console.log('timer ended!');
                        SocketIoServer.moveElementInArray(sessionSettings.participants, 0, sessionSettings.participants.length - 1);
                        SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownRunning = false;
                        SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownLeft = sessionSettings.desiredSeconds + sessionSettings.desiredMinutes;
                        SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.COUNTDOWN_ENDED, {
                            countdownRunning: sessionSettings.countdownRunning,
                            participants: sessionSettings.participants
                        });
                    }, complete: () => {
                        console.log('timerObservable completed!')
                    }
                })
            } else {
                sessionSettings.timerSubscription.unsubscribe();
                sessionSettings.timerSubscription = null;
                sessionSettings.timerObservable = null;
                console.log('timerSubscription unsubscribed!');
            }
        }
    }

    private onResetCountdown() {
        return function (settingsUpdate) {
            const sessionSettings = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId);
            const newCountdownLeft = sessionSettings.desiredSeconds + sessionSettings.desiredMinutes;

            if (SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownLeft !== newCountdownLeft) {
                SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownLeft = newCountdownLeft;
                SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.COUNTDOWN_RESET, {
                    countdownRunning: SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownRunning,
                    countdownLeft: SocketIoServer.sessionSettings.get(settingsUpdate.sessionId).countdownLeft
                });
            }
        }
    }

    private onTimeSecondsSettingsChanged() {
        return function (settingsUpdate) {
            const sessionSettings = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId);
            sessionSettings.desiredSeconds = settingsUpdate.desiredSeconds;
            sessionSettings.countdownLeft = sessionSettings.desiredSeconds + sessionSettings.desiredMinutes;

            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.SECONDS_CHANGED, {
                desiredSeconds: settingsUpdate.desiredSeconds
            });
        }
    }

    private onTimeMinutesSettingsChanged() {
        return function (settingsUpdate) {
            const sessionSettings = SocketIoServer.sessionSettings.get(settingsUpdate.sessionId);
            sessionSettings.desiredMinutes = settingsUpdate.desiredMinutes;
            sessionSettings.countdownLeft = sessionSettings.desiredSeconds + sessionSettings.desiredMinutes;

            SocketIoServer.io.in(settingsUpdate.sessionId).emit(EVENT.MINUTES_CHANGED, {
                desiredMinutes: settingsUpdate.desiredMinutes
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

    private static moveElementInArray(array: { name: string, completed: boolean }[] | any[], old_index: number, new_index: number): void {
        if (array.length >= old_index && array.length && new_index) {
            array.splice(new_index, 0, array.splice(old_index, 1)[0]);
        }
    };

    private static createTimer(duration: number): Observable<number> {
        return timer(duration);
    }
}

export default SocketIoServer;