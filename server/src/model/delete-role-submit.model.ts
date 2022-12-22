import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface DeleteRoleSubmit extends SessionSettingsChangeSubmit {
    roleToDelete: string
}