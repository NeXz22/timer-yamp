import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CountdownComponent} from './countdown.component';
import {SessionService} from '../shared/session.service';
import {Pipe} from '@angular/core';


@Pipe({name: 'timerStartStopButton'})
class TimerStartStopButtonStubPipe {
    transform() {
        return '';
    }
}

@Pipe({name: 'countdown'})
class CountdownStubPipe {
    transform() {
        return '';
    }
}

describe('CountdownComponent', () => {
    let component: CountdownComponent;
    let fixture: ComponentFixture<CountdownComponent>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['']);

        await TestBed.configureTestingModule({
            declarations: [
                CountdownComponent,
                CountdownStubPipe,
                TimerStartStopButtonStubPipe,
            ],
            providers: [
                {provide: SessionService, useValue: spy}
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CountdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
