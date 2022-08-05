import {CountdownPipe} from './countdown.pipe';

describe('CountdownPipe', () => {
    it('create an instance', () => {
        const pipe = new CountdownPipe();
        expect(pipe).toBeTruthy();
    });

    it('should transform time in milliseconds to string', () => {
        const pipe = new CountdownPipe();

        const result = pipe.transform(360000);

        expect(result).toEqual('06:00');
    });

    it('should transform 0', () => {
        const pipe = new CountdownPipe();

        const result = pipe.transform(0);

        expect(result).toEqual('00:00');
    });

    it('should transform negative input', () => {
        const pipe = new CountdownPipe();

        const result = pipe.transform(-360000);

        expect(result).toEqual('00:00');
    });
});
