import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface NewGoalSubmit extends SessionSettingsChangeSubmit {
    newGoal: string
}