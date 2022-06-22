import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SessionComponent} from './session.component';
import {RouterTestingModule} from '@angular/router/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';

describe('SessionComponent', () => {
    let component: SessionComponent;
    let fixture: ComponentFixture<SessionComponent>;
    let router: Router;
    let routerSpy: jasmine.Spy;
    let route: ActivatedRoute;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SessionComponent],
            imports: [RouterTestingModule]
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

    it('should retrieve session-name from activated route', () => {
        expect(component.sessionName).toEqual('testSession');
    });

    it('should not navigate when sessionName is set', () => {
        expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should navigate when sessionName is not set', () => {
        route.queryParams = of({id: ''});

        component.ngOnInit();

        expect(routerSpy).toHaveBeenCalled();
    });

    it('should navigate when queryParams are not retrievable', () => {
        route.queryParams = throwError(() => 'error');

        component.ngOnInit();

        expect(routerSpy).toHaveBeenCalled();
    });
});