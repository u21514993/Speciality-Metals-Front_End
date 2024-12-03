import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SundryComponent } from './sundry.component';

describe('SundryComponent', () => {
  let component: SundryComponent;
  let fixture: ComponentFixture<SundryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SundryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SundryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
