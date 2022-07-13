import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';

@Component({
    selector: 'yamp-participant-list',
    templateUrl: './participant-list.component.html',
    styleUrls: ['./participant-list.component.scss']
})
export class ParticipantListComponent {

    @ViewChild('newParticipantInput', {static: true}) newParticipantInputRef!: ElementRef<HTMLInputElement>;

    @Output() participantsChange: EventEmitter<string[]> = new EventEmitter<string[]>();

    participants: string[] = [];

    onNewParticipantSubmit(): void {
        if (this.newParticipantInputRef.nativeElement.value.trim()) {
            this.participants.push(this.newParticipantInputRef.nativeElement.value.trim());
            this.newParticipantInputRef.nativeElement.value = '';
            this.participantsChange.emit(this.participants);
        }
    }
}
