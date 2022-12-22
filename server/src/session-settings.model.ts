export interface SessionSettingsModel {
    participants: any[];
    goals: any[];
    roles: string[];
    countdownRunning: boolean;
    countdownLeft: number;
    timeCountdownStarted: number;
    desiredSeconds: number;
    desiredMinutes: number;
}