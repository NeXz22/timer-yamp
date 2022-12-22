import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-goal-list',
    templateUrl: './goal-list.component.html',
    styleUrls: ['./goal-list.component.scss']
})
export class GoalListComponent implements OnInit {

    @ViewChild('newGoalInput', {static: true}) newGoalInputRef!: ElementRef<HTMLInputElement>;

    goals: string[] = [];

    constructor(
        public sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
        this.sessionService.goals$.subscribe({
            next: newGoals => {
                this.goals = newGoals;
            },
        })
    }

    onNewGoalSubmit(): void {
        const newGoal = this.newGoalInputRef.nativeElement.value.trim();
        if (newGoal) {
            this.newGoalInputRef.nativeElement.value = '';
            this.sessionService.newGoalSubmitted(newGoal);
        }
    }

    onGoalDrop(indices: { previousIndex: number; newIndex: number }): void {
        this.sessionService.goalsSortingChanged(indices);
    }

    onDeleteGoalClicked(goalToDelete: string): void {
        this.sessionService.goalDeleted(goalToDelete);
    }
}
