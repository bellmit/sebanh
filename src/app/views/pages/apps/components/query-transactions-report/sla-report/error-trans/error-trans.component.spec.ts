import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTransComponent } from './error-trans.component';

describe('ErrorTransComponent', () => {
  let component: ErrorTransComponent;
  let fixture: ComponentFixture<ErrorTransComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorTransComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
