import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SemiCircleDonutChartComponent } from './semi-circle-donut-chart.component';

describe('SemiCircleDonutChartComponent', () => {
  let component: SemiCircleDonutChartComponent;
  let fixture: ComponentFixture<SemiCircleDonutChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SemiCircleDonutChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SemiCircleDonutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
