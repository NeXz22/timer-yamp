export interface SessionSettingsModel {
    participants: any[];
    goals: any[];
    countdownRunning: boolean;
    countdownLeft: number;
    timeCountdownStarted: number;
    desiredSeconds: number;
    desiredMinutes: number;
}