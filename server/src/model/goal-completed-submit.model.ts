import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface GoalCompletedSubmit extends SessionSettingsChangeSubmit {
    goalToComplete: string
}