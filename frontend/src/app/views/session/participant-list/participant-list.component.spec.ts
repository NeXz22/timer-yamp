import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ParticipantListComponent} from './participant-list.component';
import {By} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {Component, Input} from '@angular/core';
import {SessionService} from '../shared/session.service';

@Component({selector: 'yamp-drag-drop-list', template: ''})
class DragDropListStubComponent {
    @Input() items: string[] = [];
}

describe('ParticipantListComponent', () => {
    let component: ParticipantListComponent;
    let fixture: ComponentFixture<ParticipantListComponent>;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;
    let newParticipantInput: HTMLInputElement;
    let newParticipantButton: HTMLButtonElement;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['participantsChanged']);

        await TestBed.configureTestingModule({
            declarations: [
                ParticipantListComponent,
                DragDropListStubComponent,
            ],
            imports: [
                FormsModule
            ],
            providers: [
                {provide: SessionService, useValue: spy},
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantListComponent);
        component = fixture.componentInstance;
        sessionServiceSpy = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
        newParticipantInput = fixture.debugElement.query(By.css('#new-participant-input')).nativeElement;
        newParticipantButton = fixture.debugElement.query(By.css('#new-participant-button')).nativeElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
