import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaHistoryComponent } from './sla-history.component';

describe('SlaHistoryComponent', () => {
  let component: SlaHistoryComponent;
  let fixture: ComponentFixture<SlaHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlaHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlaHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
