import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface DeleteGoalSubmit extends SessionSettingsChangeSubmit {
    goalToDelete: string
}