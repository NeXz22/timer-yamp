import {TimerStartStopButtonPipe} from './timer-start-stop-button.pipe';

describe('TimerStartStopButtonPipe', () => {
    it('create an instance', () => {
        const pipe = new TimerStartStopButtonPipe();
        expect(pipe).toBeTruthy();
    });

    it('should return `Start`', () => {
        const pipe = new TimerStartStopButtonPipe();
        const result = pipe.transform(false);
        expect(result).toBe('Start');
    });

    it('should return `Stop`', () => {
        const pipe = new TimerStartStopButtonPipe();
        const result = pipe.transform(true);
        expect(result).toBe('Stop');
    });
});
