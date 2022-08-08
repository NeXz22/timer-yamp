import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'millisecondsToMinutes',
})
export class MillisecondsToMinutesPipe implements PipeTransform {
    transform(value: number): number {
        return Math.floor((value / (1000 * 60)) % 60);
    }
}
