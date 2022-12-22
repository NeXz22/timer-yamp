import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject, Subscription, timer} from 'rxjs';
import {io, Socket} from 'socket.io-client';
import {LocalSession} from './localSession';
import {ConnectionLostDialogComponent} from '../connection-lost-dialog/connection-lost-dialog.component';
import {Dialog, DialogRef} from '@angular/cdk/dialog';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private socket: Socket | undefined = undefined;
    private sessionId: string | undefined;
    private sessionSettings: LocalSession = {
        participants: [],
        goals: [],
    }

    watching: number = 0;
    connectionStatus: boolean = false;
    participantsSubject: Subject<string[]> = new Subject<string[]>();
    participants$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    goals$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    roles$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    countdownRunning: boolean = false;
    timeLeft: number = 900000;
    countdownDesiredTime: number = 900000;
    private timerObservable: Observable<number> | null = null;
    private timerSubscription: Subscription | null = null;
    private timeAtLastTimerCall: number = 0;

    desiredSeconds: number = 0;
    desiredMinutes: number = 900000;

    private dialogRef: DialogRef<unknown, ConnectionLostDialogComponent> | null = null;

    constructor(
        public dialog: Dialog,
    ) {
    }

    connect(sessionId: string): void {
        this.sessionId = sessionId;

        this.socket = io('ws://localhost:4444');

        this.socket.on('connect', () => {
            SessionService.debugLog(`Connected to Server. User-ID: [${this.socket?.id}]`);
            this.connectionStatus = true;
            this.dialogRef?.close();
            this.dialogRef = null;

            this.socket?.emit('join session', this.sessionId);
        });

        this.socket.on('disconnect', (reason) => {
            SessionService.debugLog(`Disconnected from Server. Reason: ${reason}`);
            this.connectionStatus = false;
            this.dialogRef = this.dialog.open(ConnectionLostDialogComponent, {});
        });

        this.socket.on('to all clients', (message) => {
            SessionService.debugLog(`${message}`);
        });

        this.socket.on('watch changed', (watching) => {
            this.watching = watching;
        });

        this.socket.on('settings for requested session already exist', (message) => {
            this.sessionSettings.participants = message.participants;
            this.sessionSettings.goals = message.goals;

            this.roles$.next(message.roles);
            this.participants$.next(message.participants);
            this.goals$.next(message.goals);

            this.desiredSeconds = message.desiredSeconds;
            this.desiredMinutes = message.desiredMinutes;

            this.updateDesiredTime();

            this.countdownRunning = message.countdownRunning;
            this.timeLeft = message.countdownLeft;

            if (this.countdownRunning) {
                this.startCountdown();
            }
        });

        this.socket.on('roles changed', (roles) => {
            this.roles$.next(roles);
        });

        this.socket.on('participants updated', (participants) => {
            this.sessionSettings.participants = participants;

            this.participants$.next(participants);
        });

        this.socket.on('goals updated', (goals) => {
            this.sessionSettings.goals = goals;

            this.goals$.next(goals);
        });

        this.socket.on('countdown update', (countdownUpdate) => {
            this.timeLeft = countdownUpdate.countdownLeft;
            this.countdownRunning = countdownUpdate.countdownRunning;

            if (this.countdownRunning) {
                this.startCountdown();
            } else {
                this.stopCountdown();
            }
        });

        this.socket.on('seconds changed', (goals) => {
            this.desiredSeconds = goals.desiredSeconds;
            this.updateDesiredTime();
        });

        this.socket.on('minutes changed', (goals) => {
            this.desiredMinutes = goals.desiredMinutes;
            this.updateDesiredTime();
        });
    }

    private startCountdown() {
        this.timeAtLastTimerCall = Date.now();
        this.timerObservable = timer(100, 200);
        this.timerSubscription = this.timerObservable
            .subscribe(() => {
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.stopCountdown();
                    this.countdownRunning = false;
                    this.updateDesiredTime();
                    this.countdownEnded();
                    // TODO play sound
                } else {
                    if (this.timeAtLastTimerCall) {
                        this.timeLeft -= Date.now() - this.timeAtLastTimerCall;
                    }
                    this.timeAtLastTimerCall = Date.now();
                }
            });
    }

    private stopCountdown() {
        this.timerSubscription?.unsubscribe();
        this.timerObservable = null;
    }

    rolesSortingChanged(indices: { previousIndex: number; newIndex: number }) {
        this.socket?.emit('roles sorting changed', {
            sessionId: this.sessionId,
            indices: indices
        });
    }

    newRoleSubmitted(newRole: string) {
        this.socket?.emit('new role submitted', {
            sessionId: this.sessionId,
            newRole: newRole
        });
    }


    roleDeleted(roleToDelete: string) {
        this.socket?.emit('role deleted', {
            sessionId: this.sessionId,
            roleToDelete: roleToDelete
        });
    }

    newParticipantSubmitted(newParticipant: string) {
        this.socket?.emit('new participant submitted', {
            sessionId: this.sessionId,
            newParticipant: newParticipant
        });
    }

    participantsSortingChanged(indices: { previousIndex: number; newIndex: number }) {
        this.socket?.emit('participants sorting changed', {
            sessionId: this.sessionId,
            indices: indices
        });
    }

    participantDeleted(participantToDelete: string) {
        this.socket?.emit('participant deleted', {
            sessionId: this.sessionId,
            participantToDelete: participantToDelete
        });
    }

    goalsSortingChanged(indices: { previousIndex: number, newIndex: number }): void {
        this.socket?.emit('goals sorting changed', {
            sessionId: this.sessionId,
            indices: indices
        });
    }

    goalDeleted(goalToDelete: string): void {
        this.socket?.emit('goal deleted', {
            sessionId: this.sessionId,
            goalToDelete: goalToDelete
        });
    }

    newGoalSubmitted(newGoal: string) {
        this.socket?.emit('new goal submitted', {
            sessionId: this.sessionId,
            newGoal: newGoal
        });
    }

    startStopCountdown(): void {
        this.socket?.emit('start stop countdown', {
            sessionId: this.sessionId,
            timeLeft: this.timeLeft,
        });
    }

    resetCountdown(): void {
        this.socket?.emit('reset countdown', {
            sessionId: this.sessionId,
            timeLeft: this.countdownDesiredTime,
        });
    }

    timeSettingsChanged(value: number, type: string): void {
        if (type === 'seconds') {
            const newSeconds = value * 1000;
            this.socket?.emit('time seconds settings changed', {
                sessionId: this.sessionId,
                desiredSeconds: newSeconds,
            });
        } else if (type === 'minutes') {
            const newMinutes = value * 1000 * 60;
            this.socket?.emit('time minutes settings changed', {
                sessionId: this.sessionId,
                desiredMinutes: newMinutes,
            });
        }
    }

    static debugLog(message: string): void {
        console.debug(`${new Date().toISOString()}: ${message}.`);
    }

    private updateDesiredTime(): void {
        this.countdownDesiredTime = this.desiredSeconds + this.desiredMinutes;
        this.timeLeft = this.countdownDesiredTime;
    }

    private countdownEnded(): void {
        this.socket?.emit('countdown ended', {
            sessionId: this.sessionId,
            timeLeft: this.countdownDesiredTime,
        });
    }
}
