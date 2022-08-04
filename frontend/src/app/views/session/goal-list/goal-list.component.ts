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
        private sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
        this.sessionService.goalsSubject.subscribe({
            next: newGoals => {
                this.goals = newGoals;
            },
        })
    }

    onNewGoalSubmit(): void {
        if (this.newGoalInputRef.nativeElement.value.trim()) {
            this.goals.push(this.newGoalInputRef.nativeElement.value.trim());
            this.newGoalInputRef.nativeElement.value = '';
            this.sessionService.goalsChanged(this.goals);
        }
    }

    onGoalDrop(): void {
        this.sessionService.goalsChanged(this.goals);
    }
}
