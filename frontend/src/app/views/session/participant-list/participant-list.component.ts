import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-participant-list',
    templateUrl: './participant-list.component.html',
    styleUrls: ['./participant-list.component.scss']
})
export class ParticipantListComponent implements OnInit {

    @ViewChild('newParticipantInput', {static: true}) newParticipantInputRef!: ElementRef<HTMLInputElement>;

    participants: string[] = [];

    constructor(
        public sessionService: SessionService,
    ) {
    }

    ngOnInit(): void {
        this.sessionService.participantsSubject.subscribe({
            next: newParticipants => {
                this.participants = newParticipants;
            },
        })
    }

    onNewParticipantSubmit(): void {
        const newParticipant = this.newParticipantInputRef.nativeElement.value.trim();
        if (newParticipant) {
            this.newParticipantInputRef.nativeElement.value = '';
            this.sessionService.newParticipantSubmitted(newParticipant);
        }
    }

    onParticipantDrop(indices: { previousIndex: number; newIndex: number }): void {
        this.sessionService.participantsSortingChanged(indices);
    }

    onDeleteParticipantClicked(participantToDelete: string): void {
        this.sessionService.participantDeleted(participantToDelete);
    }
}
