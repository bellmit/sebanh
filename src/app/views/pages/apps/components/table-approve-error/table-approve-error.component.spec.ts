import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableApproveErrorComponent } from './table-approve-error.component';

describe('TableApproveErrorComponent', () => {
  let component: TableApproveErrorComponent;
  let fixture: ComponentFixture<TableApproveErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableApproveErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableApproveErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
