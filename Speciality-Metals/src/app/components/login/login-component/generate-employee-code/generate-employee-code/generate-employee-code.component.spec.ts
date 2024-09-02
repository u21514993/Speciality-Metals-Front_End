import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateEmployeeCodeComponent } from './generate-employee-code.component';

describe('GenerateEmployeeCodeComponent', () => {
  let component: GenerateEmployeeCodeComponent;
  let fixture: ComponentFixture<GenerateEmployeeCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateEmployeeCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateEmployeeCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
