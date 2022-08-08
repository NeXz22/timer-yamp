import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionLostDialogComponent } from './connection-lost-dialog.component';

describe('ConnectionLostDialogComponent', () => {
  let component: ConnectionLostDialogComponent;
  let fixture: ComponentFixture<ConnectionLostDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectionLostDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionLostDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
