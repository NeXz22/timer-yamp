import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                HomeComponent
            ],
            imports: [
                RouterTestingModule,
                FormsModule,
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        router = TestBed.inject(Router);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to session-component', () => {
        const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
        component.sessionName = 'testSession';

        component.onSubmit();

        expect(routerSpy).toHaveBeenCalled();
        expect(routerSpy.calls.first().args[0]).toEqual(['/s']);
    });
});
