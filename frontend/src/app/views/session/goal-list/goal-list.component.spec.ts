import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GoalListComponent} from './goal-list.component';
import {By} from '@angular/platform-browser';
import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SessionService} from '../shared/session.service';
import {BehaviorSubject} from 'rxjs';
import {Goal} from '../shared/goal.model';

@Component({selector: 'yamp-drag-drop-list', template: ''})
class DragDropListStubComponent {
    @Input() items: string[] = [];
}

describe('GoalListComponent', () => {
    let component: GoalListComponent;
    let fixture: ComponentFixture<GoalListComponent>;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;
    let newGoalInput: HTMLInputElement;
    let newGoalButton: HTMLButtonElement;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['goalsChanged']);

        await TestBed.configureTestingModule({
            declarations: [
                GoalListComponent,
                DragDropListStubComponent,
            ],
            imports: [
                FormsModule,
            ],
            providers: [
                {provide: SessionService, useValue: spy},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(GoalListComponent);
        component = fixture.componentInstance;
        sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
        sessionServiceSpy.goals$ = new BehaviorSubject<Goal[]>([]);
        newGoalInput = fixture.debugElement.query(By.css('#new-goal-input')).nativeElement;
        newGoalButton = fixture.debugElement.query(By.css('#new-goal-button')).nativeElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
