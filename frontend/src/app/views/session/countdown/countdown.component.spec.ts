import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CountdownComponent} from './countdown.component';
import {CountdownPipe} from '../shared/countdown.pipe';

describe('CountdownComponent', () => {
    let component: CountdownComponent;
    let fixture: ComponentFixture<CountdownComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                CountdownComponent,
                CountdownPipe,
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
