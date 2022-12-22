import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface NewParticipantSubmit extends SessionSettingsChangeSubmit {
    newParticipant: string
}