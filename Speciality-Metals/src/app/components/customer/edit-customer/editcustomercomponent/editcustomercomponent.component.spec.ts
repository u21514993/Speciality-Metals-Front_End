import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditcustomercomponentComponent } from './editcustomercomponent.component';

describe('EditcustomercomponentComponent', () => {
  let component: EditcustomercomponentComponent;
  let fixture: ComponentFixture<EditcustomercomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditcustomercomponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditcustomercomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
