export const EVENT = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    DISCONNECTING: 'disconnecting',
    SESSION_JOINED: 'join session',
    PARTICIPANTS_CHANGED: 'participants changed',
    PARTICIPANT_SORTING_CHANGED: 'participants sorting changed',
    NEW_PARTICIPANT_SUBMITTED: 'new participant submitted',
    PARTICIPANT_DELETED: 'participant deleted',
    GOALS_SORTING_CHANGED: 'goals sorting changed',
    NEW_GOAL_SUBMITTED: 'new goal submitted',
    GOAL_DELETED: 'goal deleted',
    GOAL_COMPLETED: 'goal completed',
    START_STOP_COUNTDOWN: 'start stop countdown',
    RESET_COUNTDOWN: 'reset countdown',
    COUNTDOWN_ENDED: 'countdown ended',
    TIME_SECONDS_SETTINGS_CHANGED: 'time seconds settings changed',
    TIME_MINUTES_SETTINGS_CHANGED: 'time minutes settings changed',
    WATCH_CHANGED: 'watch changed',
    TO_ALL_CLIENTS: 'to all clients',
    SETTINGS_FOR_REQUESTED_SESSION_ALREADY_EXIST: 'settings for requested session already exist',
    PARTICIPANTS_UPDATED: 'participants updated',
    GOALS_UPDATED: 'goals updated',
    COUNTDOWN_UPDATE: 'countdown update',
    SECONDS_CHANGED: 'seconds changed',
    MINUTES_CHANGED: 'minutes changed',
    NEW_ROLE_SUBMITTED: 'new role submitted',
    ROLES_CHANGED: 'roles changed',
    ROLE_DELETED: 'role deleted',
    ROLES_SORTING_CHANGED: 'roles sorting changed',
} as const;