import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryTransactionComponent } from './query-transaction.component';

describe('QueryTransactionComponent', () => {
  let component: QueryTransactionComponent;
  let fixture: ComponentFixture<QueryTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
