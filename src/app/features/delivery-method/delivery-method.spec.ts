import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryMethod } from './delivery-method';

describe('DeliveryMethod', () => {
  let component: DeliveryMethod;
  let fixture: ComponentFixture<DeliveryMethod>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryMethod],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryMethod);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
