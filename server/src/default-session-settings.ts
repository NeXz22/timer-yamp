import {SessionSettingsModel} from './session-settings.model';

export const DEFAULT_SESSION_SETTINGS: SessionSettingsModel = {
    participants: [],
    goals: [],
    roles: ['driver', 'navigator'],
    countdownRunning: false,
    countdownLeft: 900000,
    timeCountdownStarted: 0,
    desiredSeconds: 0,
    desiredMinutes: 900000,
};