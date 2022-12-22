import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface NewRoleSubmit extends SessionSettingsChangeSubmit {
    newRole: string
}