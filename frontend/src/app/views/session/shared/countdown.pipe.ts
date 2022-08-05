import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'countdown'
})
export class CountdownPipe implements PipeTransform {

    /**
     * Converts a given time into a formatted string (mm:ss)
     * @param time - time in milliseconds
     */
    transform(time: number): string {
        const timeInSeconds = time / 1000;
        if (timeInSeconds > 0) {
            const seconds = timeInSeconds % 60;
            const minutes = Math.floor(timeInSeconds / 60) % 60;
            return [minutes, seconds].map(v => v < 10 ? '0' + v : v).join(':');
        } else {
            return '00:00';
        }
    }

}
