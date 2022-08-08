import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-time-input',
    templateUrl: './time-input.component.html',
    styleUrls: ['./time-input.component.scss']
})
export class TimeInputComponent {

    @ViewChild('numberInput', {static: true}) numberInputRef!: ElementRef<HTMLInputElement>;

    @Input() value: number = 0;
    @Input() type!: string;

    placeholderValue: number = 0;

    constructor(
        public sessionService: SessionService,
    ) {
    }

    onInput(): void {
        let value = this.numberInputRef.nativeElement.value;

        if (value.length > 2) {
            value = value.substring(0, 2);
        }
        if (+value > 59) {
            value = value.substring(0, 1);
        }
        if (value.length == 2 && value.charAt(0) === '0') {
            value = value.charAt(1);
        }

        this.numberInputRef.nativeElement.value = value;

        this.sessionService.timeSettingsChanged(+value, this.type);
    }
}
