import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'yamp-participant-list',
    templateUrl: './participant-list.component.html',
    styleUrls: ['./participant-list.component.scss']
})
export class ParticipantListComponent {

    @ViewChild('newParticipantInput', {static: true}) newParticipantInputRef!: ElementRef<HTMLInputElement>;

    participants: string[] = [];


    onNewParticipantSubmit(): void {
        this.participants.push(this.newParticipantInputRef.nativeElement.value);
        this.newParticipantInputRef.nativeElement.value = '';
    }
}
