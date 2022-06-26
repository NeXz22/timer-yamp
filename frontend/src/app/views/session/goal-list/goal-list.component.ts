import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'yamp-goal-list',
    templateUrl: './goal-list.component.html',
    styleUrls: ['./goal-list.component.scss']
})
export class GoalListComponent {

    @ViewChild('newGoalInput', {static: true}) newGoalInputRef!: ElementRef<HTMLInputElement>;

    goals: string[] = [];

    onNewGoalSubmit(): void {
        this.goals.push(this.newGoalInputRef.nativeElement.value);
        this.newGoalInputRef.nativeElement.value = '';
    }
}
