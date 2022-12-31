import {Observable, Subscription} from 'rxjs';

export interface SessionSettingsModel {
    participants: any[];
    goals: {name: string, completed: boolean}[];
    roles: string[];
    countdownRunning: boolean;
    countdownLeft: number;
    timeCountdownStarted: number;
    desiredSeconds: number;
    desiredMinutes: number;
    timerObservable?: Observable<number>;
    timerSubscription?: Subscription;
}