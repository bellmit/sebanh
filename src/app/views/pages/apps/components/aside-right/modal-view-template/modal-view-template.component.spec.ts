import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewTemplateComponent } from './modal-view-template.component';

describe('ModalViewTemplateComponent', () => {
  let component: ModalViewTemplateComponent;
  let fixture: ComponentFixture<ModalViewTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalViewTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
