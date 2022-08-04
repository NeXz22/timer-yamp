import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DragDropListComponent} from './drag-drop-list.component';

describe('DragDropListComponent', () => {
    let component: DragDropListComponent;
    let fixture: ComponentFixture<DragDropListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                DragDropListComponent,
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DragDropListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return true for empty arrays', () => {
        const array1: string[] = [];
        const array2: string[] = [];

        const result = component.isEqual(array1, array2);

        expect(result).toBeTrue();
    });

    it('should return true', () => {
        const array1: string[] = ['1', '2', '3'];
        const array2: string[] = ['1', '2', '3'];

        const result = component.isEqual(array1, array2);

        expect(result).toBeTrue();
    });

    it('should return false for unequal order', () => {
        const array1: string[] = ['2', '3', '1'];
        const array2: string[] = ['1', '2', '3'];

        const result = component.isEqual(array1, array2);

        expect(result).toBeFalse();
    });

    it('should return false for unequal length', () => {
        const array1: string[] = ['1', '2', '3'];
        const array2: string[] = ['1', '2', '3', '4'];

        const result = component.isEqual(array1, array2);

        expect(result).toBeFalse();
    });
});
