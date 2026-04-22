import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfirmation } from './user-confirmation';

describe('UserConfirmation', () => {
  let component: UserConfirmation;
  let fixture: ComponentFixture<UserConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(UserConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
