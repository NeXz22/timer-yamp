import {Component, OnInit} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit {

    constructor(
        public sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
    }

    onStartStopClicked(): void {
        this.sessionService.startStopCountdown();
    }

    onResetClicked(): void {
        this.sessionService.resetCountdown();
    }
}
