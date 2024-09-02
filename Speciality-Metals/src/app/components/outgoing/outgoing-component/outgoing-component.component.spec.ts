import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutgoingComponentComponent } from './outgoing-component.component';

describe('OutgoingComponentComponent', () => {
  let component: OutgoingComponentComponent;
  let fixture: ComponentFixture<OutgoingComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutgoingComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutgoingComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
