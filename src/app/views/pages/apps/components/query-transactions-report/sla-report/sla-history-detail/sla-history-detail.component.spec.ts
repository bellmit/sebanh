import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlaHistoryDetailComponent } from './sla-history-detail.component';

describe('SlaHistoryDetailComponent', () => {
  let component: SlaHistoryDetailComponent;
  let fixture: ComponentFixture<SlaHistoryDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlaHistoryDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlaHistoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
