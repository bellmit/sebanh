import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaRealtimeComponent } from './sla-realtime.component';

describe('SlaRealtimeComponent', () => {
  let component: SlaRealtimeComponent;
  let fixture: ComponentFixture<SlaRealtimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlaRealtimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlaRealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
