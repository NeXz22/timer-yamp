import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription, takeWhile, timer} from 'rxjs';
import {io, Socket} from 'socket.io-client';
import {Goal} from './goal.model';
import {NotificationService} from './notification.service';
import {Title} from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private socket: Socket | undefined = undefined;
    private sessionId: string | undefined;

    watching: number = 0;
    isConnectedToServer: boolean = false;
    participants$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    goals$: BehaviorSubject<Goal[]> = new BehaviorSubject<Goal[]>([]);
    roles$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
    countdownRunning: boolean = false;
    timeLeft: number = 900000;
    countdownDesiredTime: number = 900000;
    private timerObservable$: Observable<number> | null = null;
    private timerSubscription$: Subscription | null = null;
    private timeAtLastTimerCall: number = 0;

    desiredSeconds: number = 0;
    desiredMinutes: number = 900000;

    sounds: { name: string, src: string }[] = [
        {name: 'announcement', src: 'announcement-sound-4-21464.mp3'},
        {name: 'glass-breaking', src: 'glass-breaking-93803.mp3'},
        {name: 'metal-design-explosion', src: 'metal-design-explosion-13491.mp3'},
        {name: 'surprise', src: 'surprise-sound-effect-99300.mp3'},
        {name: 'swoosh', src: 'clean-fast-swooshaiff-14784.mp3'},
        {name: 'whoosh', src: 'whoosh-6316.mp3'},
    ];
    selectedSound: { name: string, src: string } = this.sounds[0];
    selectedVolume: number = 50;

    constructor(
        private readonly notificationService: NotificationService,
        private readonly titleService: Title,
    ) {
    }

    connect(sessionId: string): void {
        this.sessionId = sessionId;

        this.socket = io('ws://localhost:4444');

        this.socket.on('connect', () => {
            SessionService.debugLog(`Connected to Server. User-ID: [${this.socket?.id}]`);
            this.isConnectedToServer = true;
            this.socket?.emit('join session', this.sessionId);
        });

        this.socket.on('disconnect', (reason) => {
            this.notificationService.addErrorNotification('You have lost connection to the server! \n Please refresh the site to avoid any further problems.')
            SessionService.debugLog(`Disconnected from Server. Reason: ${reason}`);
            this.isConnectedToServer = false;

            this.titleService.setTitle('YAMP');
        });

        this.socket.on('to all clients', (message) => {
            SessionService.debugLog(`${message}`);
        });

        this.socket.on('watch changed', (watching) => {
            this.watching = watching;
        });

        this.socket.on('settings for requested session already exist', (message) => {
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
            this.participants$.next(participants);
        });

        this.socket.on('goals updated', (goals) => {
            this.goals$.next(goals);
        });

        this.socket.on('countdown update', (countdownUpdate) => {
            this.timeLeft = countdownUpdate.countdownLeft;
            this.countdownRunning = countdownUpdate.countdownRunning;

            if (this.countdownRunning) {
                this.startCountdown();
                this.notificationService.addSuccessNotification('Timer started!');
            } else {
                this.notificationService.addWarnNotification('Timer stopped!');
                this.stopCountdown();
            }
        });

        this.socket.on('countdown reset', (countdownUpdate) => {
            this.timeLeft = countdownUpdate.countdownLeft;
            this.countdownRunning = countdownUpdate.countdownRunning;

            this.notificationService.addWarnNotification('Timer reset!');
            this.stopCountdown();
        });


        this.socket.on('seconds changed', (secondsUpdate) => {
            this.desiredSeconds = secondsUpdate.desiredSeconds;
            this.updateDesiredTime();
        });

        this.socket.on('minutes changed', (minutesUpdate) => {
            this.desiredMinutes = minutesUpdate.desiredMinutes;
            this.updateDesiredTime();
        });

        this.socket.on('countdown ended', (settings) => {
            this.countdownRunning = settings.countdownRunning;
            this.participants$.next(settings.participants);
            this.timerSubscription$?.unsubscribe();
            this.updateDesiredTime();
            this.createUpdatedRolesNotification();
            this.playSelectedSound();
            this.titleService.setTitle('YAMP - ' + this.sessionId);
        });
    }

    private createUpdatedRolesNotification() {
        let message = '';
        const _participants = this.participants$.getValue();
        const _roles = this.roles$.getValue();
        for (let i = 0; i < _roles.length; i++) {
            if (i < _participants.length) {
                const role = _roles[i];
                const participant = _participants[i];
                message += '\n' + participant + ' is the new ' + role + '.';
            }
        }
        this.notificationService.addSuccessNotification('Time ran out.' + message);
    }

    private startCountdown() {
        this.titleService.setTitle(this.timeLeft + 'YAMP - ' + this.sessionId);
        this.timeAtLastTimerCall = Date.now();
        this.timerObservable$ = timer(100, 200);
        this.timerSubscription$ = this.timerObservable$
            .pipe(takeWhile(() => this.timeLeft > 0))
            .subscribe(() => {
                if (this.timeAtLastTimerCall) {
                    this.timeLeft -= Date.now() - this.timeAtLastTimerCall;
                }
                this.timeAtLastTimerCall = Date.now();
                this.titleService.setTitle(this.formatTime(this.timeLeft) + ' - YAMP - ' + this.sessionId);
            });
    }

    private stopCountdown() {
        this.timerSubscription$?.unsubscribe();
        this.timerSubscription$ = null;
        this.timerObservable$ = null;
        this.titleService.setTitle('YAMP - ' + this.sessionId);
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

    goalDeleted(goalToDelete: Goal): void {
        this.socket?.emit('goal deleted', {
            sessionId: this.sessionId,
            goalToDelete: goalToDelete.name
        });
    }

    goalCompleted(goalCompleted: Goal) {
        this.socket?.emit('goal completed', {
            sessionId: this.sessionId,
            goalToComplete: goalCompleted.name
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

    private formatTime(timeInMilliseconds: number): string {
        const timeInSeconds = timeInMilliseconds / 1000;
        if (timeInSeconds > 0) {
            const seconds = Math.floor(timeInSeconds % 60);
            const minutes = Math.floor(timeInSeconds / 60) % 60;
            return [minutes, seconds].map(v => v < 10 ? '0' + v : v).join(':');
        } else {
            return '00:00';
        }
    }

    playSelectedSound(): void {
        const audio = new Audio();
        audio.src = '../../../assets/sounds/' + this.selectedSound.src;
        audio.volume = this.selectedVolume / 100;
        audio.load();
        audio.play()
            .then()
            .catch(reason => {
                console.log(reason);
            })
    }

    destroySession(): void {
        this.timerSubscription$?.unsubscribe();
        this.timerSubscription$ = null;
        this.timerObservable$ = null;
        this.socket?.disconnect();
        this.notificationService.notifications = [];
    }
}
