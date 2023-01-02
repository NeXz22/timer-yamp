import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';
import {SessionService} from './shared/session.service';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'yamp-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit, OnDestroy {

    sessionId: string = '';
    currentUrl: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public sessionService: SessionService,
        private readonly titleService: Title,
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

        this.sessionService.connect(this.sessionId);

        this.titleService.setTitle('YAMP - ' + this.sessionId);
    }

    ngOnDestroy(): void {
        this.sessionService.destroySession();
        this.titleService.setTitle('YAMP');
    }
}
