import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'millisecondsToSeconds'
})
export class MillisecondsToSecondsPipe implements PipeTransform {
    transform(value: number): number {
        return value / 1000 % 60;
    }
}
