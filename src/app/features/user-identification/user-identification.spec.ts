import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIdentification } from './user-identification';

describe('UserIdentification', () => {
  let component: UserIdentification;
  let fixture: ComponentFixture<UserIdentification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserIdentification],
    }).compileComponents();

    fixture = TestBed.createComponent(UserIdentification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
