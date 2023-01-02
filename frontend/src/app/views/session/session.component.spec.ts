import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SessionComponent} from './session.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {Component, Input, Pipe} from '@angular/core';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {SessionService} from './shared/session.service';
import {Title} from '@angular/platform-browser';


@Component({selector: 'yamp-participant-list', template: ''})
class ParticipantListStubComponent {
}

@Component({selector: 'yamp-goal-list', template: ''})
class GoalListStubComponent {
}

@Component({selector: 'yamp-countdown', template: ''})
class CountdownStubComponent {
}

@Component({selector: 'yamp-time-input', template: ''})
class TimeInputStubComponent {
    @Input() value: number = 0;
}

@Pipe({name: 'millisecondsToMinutes'})
class MillisecondsToMinutesStubPipe {
    transform(value: number) {
        return value;
    }
}

@Pipe({name: 'millisecondsToSeconds'})
class MillisecondsToSecondsStubPipe {
    transform(value: number) {
        return value;
    }
}

describe('SessionComponent', () => {
    let component: SessionComponent;
    let fixture: ComponentFixture<SessionComponent>;
    let router: Router;
    let routerSpy: jasmine.Spy;
    let route: ActivatedRoute;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SessionService', ['connect', 'destroySession']);

        await TestBed.configureTestingModule({
            declarations: [
                SessionComponent,
                ParticipantListStubComponent,
                GoalListStubComponent,
                CountdownStubComponent,
                TimeInputStubComponent,
                MillisecondsToMinutesStubPipe,
                MillisecondsToSecondsStubPipe,
            ],
            imports: [
                RouterTestingModule,
                ClipboardModule,
            ],
            providers: [
                {provide: SessionService, useValue: spy},
                Title
            ]
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
