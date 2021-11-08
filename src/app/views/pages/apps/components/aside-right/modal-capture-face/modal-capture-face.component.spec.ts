import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCaptureFaceComponent } from './modal-capture-face.component';

describe('ModalCaptureFaceComponent', () => {
  let component: ModalCaptureFaceComponent;
  let fixture: ComponentFixture<ModalCaptureFaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCaptureFaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCaptureFaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
