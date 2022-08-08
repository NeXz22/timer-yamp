import {Injectable} from '@angular/core';
import {Observable, Subject, Subscription, timer} from 'rxjs';
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
    goalsSubject: Subject<string[]> = new Subject<string[]>();
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

            this.participantsSubject.next(this.sessionSettings.participants);
            this.goalsSubject.next(this.sessionSettings.goals);

            this.desiredSeconds = message.desiredSeconds;
            this.desiredMinutes = message.desiredMinutes;

            this.updateDesiredTime();

            this.countdownRunning = message.countdownRunning;
            this.timeLeft = message.countdownLeft;

            if (this.countdownRunning) {
                this.startCountdown();
            }
        });

        this.socket.on('participants updated', (participants) => {
            this.sessionSettings.participants = participants;

            this.participantsSubject.next(this.sessionSettings.participants);
        });

        this.socket.on('goals updated', (goals) => {
            this.sessionSettings.goals = goals;

            this.goalsSubject.next(this.sessionSettings.goals);
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
        this.timerObservable = timer(100, 500);
        this.timerSubscription = this.timerObservable
            .subscribe(() => {
                if (this.timeAtLastTimerCall) {
                    this.timeLeft -= Date.now() - this.timeAtLastTimerCall;
                }
                this.timeAtLastTimerCall = Date.now();
            });
    }

    private stopCountdown() {
        this.timerSubscription?.unsubscribe();
        this.timerObservable = null;
    }

    participantsChanged(participants: string[]): void {
        this.sessionSettings.participants = participants;
        this.socket?.emit('participants changed', {
            sessionId: this.sessionId,
            participants: this.sessionSettings.participants
        });
    }

    goalsChanged(goals: string[]): void {
        this.sessionSettings.goals = goals;
        this.socket?.emit('goals changed', {
            sessionId: this.sessionId,
            goals: this.sessionSettings.goals
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
}
