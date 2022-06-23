import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {first} from 'rxjs';

@Component({
    selector: 'yamp-session',
    templateUrl: './session.component.html',
    styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

    sessionName: string = '';
    currentUrl: string = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        this.route.queryParams.pipe(first()).subscribe({
            next: params => {
                this.sessionName = params['id'];
                if (!this.sessionName) {
                    this.router.navigate(['']).then();
                }
            },
            error: () => {
                this.router.navigate(['']).then();
            },
            complete: () => {
            }
        });

        this.currentUrl = window.location.href;
    }
}
