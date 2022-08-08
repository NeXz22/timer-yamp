import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CountdownComponent} from './countdown.component';
import {CountdownPipe} from '../shared/countdown.pipe';
import {SessionService} from '../shared/session.service';

describe('CountdownComponent', () => {
    let component: CountdownComponent;
    let fixture: ComponentFixture<CountdownComponent>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['']);

        await TestBed.configureTestingModule({
            declarations: [
                CountdownComponent,
                CountdownPipe,
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
