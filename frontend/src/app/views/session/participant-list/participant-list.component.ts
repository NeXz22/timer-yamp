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
        private sessionService: SessionService,
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
        if (this.newParticipantInputRef.nativeElement.value.trim()) {
            this.participants.push(this.newParticipantInputRef.nativeElement.value.trim());
            this.newParticipantInputRef.nativeElement.value = '';
            this.sessionService.participantsChanged(this.participants);
        }
    }

    onParticipantDrop(): void {
        this.sessionService.participantsChanged(this.participants);
    }
}
