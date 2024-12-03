import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCustComponent } from './report-cust.component';

describe('ReportCustComponent', () => {
  let component: ReportCustComponent;
  let fixture: ComponentFixture<ReportCustComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCustComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
