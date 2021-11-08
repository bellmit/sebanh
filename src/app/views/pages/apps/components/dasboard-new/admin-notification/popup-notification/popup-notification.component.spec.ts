import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNotificationComponent } from './popup-notification.component';

describe('PopupNotificationComponent', () => {
  let component: PopupNotificationComponent;
  let fixture: ComponentFixture<PopupNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
