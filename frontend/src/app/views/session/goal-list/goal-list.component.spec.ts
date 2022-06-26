import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GoalListComponent} from './goal-list.component';
import {By} from '@angular/platform-browser';
import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({selector: 'yamp-drag-drop-list', template: ''})
class DragDropListStubComponent {
    @Input() items: string[] = [];
}

describe('GoalListComponent', () => {
    let component: GoalListComponent;
    let fixture: ComponentFixture<GoalListComponent>;
    let newGoalInput: HTMLInputElement;
    let newGoalButton: HTMLButtonElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GoalListComponent,
                DragDropListStubComponent,
            ],
            imports: [
                FormsModule,
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GoalListComponent);
        component = fixture.componentInstance;
        newGoalInput = fixture.debugElement.query(By.css('#new-goal-input')).nativeElement;
        newGoalButton = fixture.debugElement.query(By.css('#new-goal-button')).nativeElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should add input value to goals-array', () => {
        newGoalInput.value = 'new goal';
        newGoalButton.click();

        expect(component.goals).toEqual(['new goal']);
    });

    it('should clear input after submit', () => {
        newGoalInput.value = 'new goal';
        newGoalButton.click();

        expect(newGoalInput.value).toBe('');
    });
});
