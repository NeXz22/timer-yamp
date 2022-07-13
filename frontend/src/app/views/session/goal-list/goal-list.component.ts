import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'yamp-goal-list',
    templateUrl: './goal-list.component.html',
    styleUrls: ['./goal-list.component.scss']
})
export class GoalListComponent {

    @ViewChild('newGoalInput', {static: true}) newGoalInputRef!: ElementRef<HTMLInputElement>;

    @Output() goalsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    goals: string[] = [];

    onNewGoalSubmit(): void {
        if (this.newGoalInputRef.nativeElement.value.trim()) {
            this.goals.push(this.newGoalInputRef.nativeElement.value.trim());
            this.newGoalInputRef.nativeElement.value = '';
            this.goalsChange.emit(this.goals);
        }
    }
}
