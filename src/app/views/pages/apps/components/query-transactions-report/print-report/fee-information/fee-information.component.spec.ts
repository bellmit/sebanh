import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeInformationComponent } from './fee-information.component';

describe('FeeInformationComponent', () => {
  let component: FeeInformationComponent;
  let fixture: ComponentFixture<FeeInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeeInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
