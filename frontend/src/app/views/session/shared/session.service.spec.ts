import {TestBed} from '@angular/core/testing';

import {SessionService} from './session.service';
import {Dialog} from '@angular/cdk/dialog';

describe('SessionService', () => {
    let service: SessionService;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('Dialog', ['open', 'close']);

        TestBed.configureTestingModule({
            providers: [
                {provide: Dialog, useValue: spy},
            ],
        });
        service = TestBed.inject(SessionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
