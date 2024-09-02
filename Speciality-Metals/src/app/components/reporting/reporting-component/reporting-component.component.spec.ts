import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingComponentComponent } from './reporting-component.component';

describe('ReportingComponentComponent', () => {
  let component: ReportingComponentComponent;
  let fixture: ComponentFixture<ReportingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
