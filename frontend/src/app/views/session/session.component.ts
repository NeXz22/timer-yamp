import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';
import {Session} from './shared/session';
import {io, Socket} from 'socket.io-client';
import {LocalSession} from './shared/localSession';

@Component({
    selector: 'yamp-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    sessionId: string = '';
    currentUrl: string = '';
    connectionStatus: boolean = false;
    watching: number = 0;
    session!: Session;
    private socket: Socket | undefined;
    private sessionSettings: LocalSession = {
        participants: [],
        goals: [],
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        this.route.queryParams.pipe(first()).subscribe({
            next: params => {
                this.sessionId = params['id'];
                if (!this.sessionId) {
                    this.router.navigate(['']).then();
                }
            },
            error: () => {
                this.router.navigate(['']).then();
            },
        });

        this.currentUrl = window.location.href;

        this.setupSocketConnection();
    }

    private setupSocketConnection(): void {
        this.socket = io('ws://localhost:4444');

        this.socket.on('connect', () => {
            SessionComponent.debugLog(`Connected to Server. User-ID: [${this.socket?.id}]`);
            this.connectionStatus = true;

            this.socket?.emit('join session', this.sessionId);
        });

        this.socket.on("disconnect", (reason) => {
            this.connectionStatus = false;
            SessionComponent.debugLog(`Disconnected from Server. Reason: ${reason}`);
        });

        this.socket.on('to all clients', (message) => {
            SessionComponent.debugLog(`${message}`);
        });
    }

    private static debugLog(message: string): void {
        console.debug(`${new Date().toISOString()}: ${message}.`);
    }

    onParticipantsChanged(participants: string[]): void {
        this.sessionSettings.participants = participants;
    }

    onGoalsChanged(goals: string[]): void {
        this.sessionSettings.goals = goals;
    }
}
