import {MillisecondsToMinutesPipe} from './milliseconds-to-minutes.pipe';

describe('MillisecondsToMinutesPipe', () => {
    it('create an instance', () => {
        const pipe = new MillisecondsToMinutesPipe();
        expect(pipe).toBeTruthy();
    });
});
