import {Component, ElementRef, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-goal-list',
    templateUrl: './goal-list.component.html',
    styleUrls: ['./goal-list.component.scss']
})
export class GoalListComponent {

    @ViewChild('newGoalInput', {static: true}) newGoalInputRef!: ElementRef<HTMLInputElement>;

    constructor(
        public sessionService: SessionService,
    ) {
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
