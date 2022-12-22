import {SessionSettingsChangeSubmit} from './session-submit.model';

export interface ArraySortingSubmit extends SessionSettingsChangeSubmit {
    indices: {
        previousIndex: number,
        newIndex: number
    }
}