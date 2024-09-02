import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingComponentComponent } from './incoming-component.component';

describe('IncomingComponentComponent', () => {
  let component: IncomingComponentComponent;
  let fixture: ComponentFixture<IncomingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomingComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
