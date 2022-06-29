import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';
import {Session} from './shared/session';

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
    }
}
