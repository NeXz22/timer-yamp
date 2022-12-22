import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RoleListComponent} from './role-list.component';
import {SessionService} from '../shared/session.service';
import {Component, Input} from '@angular/core';

@Component({selector: 'yamp-drag-drop-list', template: ''})
class DragDropListStubComponent {
    @Input() items: string[] = [];
}


describe('RoleListComponent', () => {
    let component: RoleListComponent;
    let fixture: ComponentFixture<RoleListComponent>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['']);

        await TestBed.configureTestingModule({
            declarations: [
                RoleListComponent,
                DragDropListStubComponent,
            ],
            providers: [
                {provide: SessionService, useValue: spy},
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(RoleListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
