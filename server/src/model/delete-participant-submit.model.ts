import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface DeleteParticipantSubmit extends SessionSettingsChangeSubmit {
    participantToDelete: string
}