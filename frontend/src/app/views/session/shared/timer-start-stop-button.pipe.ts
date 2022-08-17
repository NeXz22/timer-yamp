import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'timerStartStopButton'
})
export class TimerStartStopButtonPipe implements PipeTransform {
    transform(value: boolean): string {
        return value ? 'Stop' : 'Start';
    }
}
