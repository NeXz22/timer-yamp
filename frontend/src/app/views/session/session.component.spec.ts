import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SessionComponent} from './session.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {Component} from '@angular/core';
import {ClipboardModule} from '@angular/cdk/clipboard';


@Component({selector: 'yamp-participant-list', template: ''})
class ParticipantListStubComponent {
}

@Component({selector: 'yamp-goal-list', template: ''})
class GoalListStubComponent {
}

@Component({selector: 'yamp-countdown', template: ''})
class CountdownStubComponent {
}

describe('SessionComponent', () => {
    let component: SessionComponent;
    let fixture: ComponentFixture<SessionComponent>;
    let router: Router;
    let routerSpy: jasmine.Spy;
    let route: ActivatedRoute;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                SessionComponent,
                ParticipantListStubComponent,
                GoalListStubComponent,
                CountdownStubComponent,
            ],
            imports: [
                RouterTestingModule,
                ClipboardModule,
            ],
            providers: []
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SessionComponent);
        router = TestBed.inject(Router);
        routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
        route = TestBed.inject(ActivatedRoute);
        route.queryParams = of({id: 'testSession'});
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should retrieve session-id from activated route', () => {
        expect(component.sessionId).toEqual('testSession');
    });

    it('should not navigate when session-id is set', () => {
        expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should navigate when session-id is not set', () => {
        route.queryParams = of({id: ''});

        component.ngOnInit();

        expect(routerSpy).toHaveBeenCalled();
    });

    it('should navigate when queryParams are not retrievable', () => {
        route.queryParams = throwError(() => 'error');

        component.ngOnInit();

        expect(routerSpy).toHaveBeenCalled();
    });

    it('should show current url based on session name', () => {
        const expectedUrl = window.location.href;

        component.ngOnInit();

        expect(component.currentUrl).toBe(expectedUrl);
    });
});
