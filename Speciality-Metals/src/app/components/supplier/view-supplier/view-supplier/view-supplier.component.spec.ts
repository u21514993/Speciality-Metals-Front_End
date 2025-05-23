import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSupplierComponent } from './view-supplier.component';

describe('ViewSupplierComponent', () => {
  let component: ViewSupplierComponent;
  let fixture: ComponentFixture<ViewSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSupplierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
