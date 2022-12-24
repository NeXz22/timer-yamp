import {Component} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent {

    constructor(
        public sessionService: SessionService,
    ) {
    }

    onStartStopClicked(): void {
        this.sessionService.startStopCountdown();
    }

    onResetClicked(): void {
        this.sessionService.resetCountdown();
    }
}
