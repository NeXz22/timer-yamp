import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {io, Socket} from 'socket.io-client';
import {LocalSession} from './localSession';

@Injectable({
    providedIn: 'root'
})
export class SessionService {

    private socket: Socket | undefined = undefined;
    private sessionId: string | undefined;
    private sessionSettings: LocalSession = {
        participants: [],
        goals: [],
    }

    watching: number = 0;
    connectionStatus: boolean = false;
    participantsSubject: Subject<string[]> = new Subject<string[]>();
    goalsSubject: Subject<string[]> = new Subject<string[]>();

    constructor() {
    }

    connect(sessionId: string): void {
        this.sessionId = sessionId;

        this.socket = io('ws://localhost:4444');

        this.socket.on('connect', () => {
            SessionService.debugLog(`Connected to Server. User-ID: [${this.socket?.id}]`);
            this.connectionStatus = true;

            this.socket?.emit('join session', this.sessionId);
        });

        this.socket.on('disconnect', (reason) => {
            SessionService.debugLog(`Disconnected from Server. Reason: ${reason}`);
            this.connectionStatus = false;
        });

        this.socket.on('to all clients', (message) => {
            SessionService.debugLog(`${message}`);
        });

        this.socket.on('watch changed', (watching) => {
            this.watching = watching;
        });

        this.socket.on('settings for requested session already exist', (message) => {
            this.sessionSettings.participants = message.participants;
            this.sessionSettings.goals = message.goals;

            this.participantsSubject.next(this.sessionSettings.participants);
            this.goalsSubject.next(this.sessionSettings.goals);
        });

        this.socket.on('participants updated', (participants) => {
            this.sessionSettings.participants = participants;

            this.participantsSubject.next(this.sessionSettings.participants);
        });

        this.socket.on('goals updated', (goals) => {
            this.sessionSettings.goals = goals;

            this.goalsSubject.next(this.sessionSettings.goals);
        });
    }

    participantsChanged(participants: string[]): void {
        this.sessionSettings.participants = participants;
        this.socket?.emit('participants changed', {
            sessionId: this.sessionId,
            participants: this.sessionSettings.participants
        });
    }

    goalsChanged(goals: string[]): void {
        this.sessionSettings.goals = goals;
        this.socket?.emit('goals changed', {
            sessionId: this.sessionId,
            goals: this.sessionSettings.goals
        });
    }

    static debugLog(message: string): void {
        console.debug(`${new Date().toISOString()}: ${message}.`);
    }
}
