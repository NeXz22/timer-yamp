import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TimeInputComponent} from './time-input.component';
import {By} from '@angular/platform-browser';

describe('TimeInputComponent', () => {
    let component: TimeInputComponent;
    let fixture: ComponentFixture<TimeInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimeInputComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TimeInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not allow inputs with a length greater than 2', () => {
        const inputElement = getInputElement(fixture);

        inputElement.value = '111';
        inputElement.dispatchEvent(new Event('input'));

        expect(inputElement.value).toBe('11');
    });

    it('should not allow input grater than 59', () => {
        const inputElement = getInputElement(fixture);

        inputElement.value = '99';
        inputElement.dispatchEvent(new Event('input'));

        expect(inputElement.value).toBe('9');
    });

    it('should not allow input starting with a 0', () => {
        const inputElement = getInputElement(fixture);

        inputElement.value = '09';
        inputElement.dispatchEvent(new Event('input'));

        expect(inputElement.value).toBe('9');
    });
});

function getInputElement(fixture: ComponentFixture<TimeInputComponent>): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement;
}
