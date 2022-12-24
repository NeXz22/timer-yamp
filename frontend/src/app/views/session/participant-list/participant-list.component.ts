import {Component, ElementRef, ViewChild} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({
    selector: 'yamp-participant-list',
    templateUrl: './participant-list.component.html',
    styleUrls: ['./participant-list.component.scss']
})
export class ParticipantListComponent {

    @ViewChild('newParticipantInput', {static: true}) newParticipantInputRef!: ElementRef<HTMLInputElement>;

    constructor(
        public sessionService: SessionService,
    ) {
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
