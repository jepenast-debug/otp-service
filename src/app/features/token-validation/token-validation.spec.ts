import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenValidation } from './token-validation';

describe('TokenValidation', () => {
  let component: TokenValidation;
  let fixture: ComponentFixture<TokenValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenValidation],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenValidation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
