import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoanRequest } from './user-loan-request';

describe('UserLoanRequest', () => {
  let component: UserLoanRequest;
  let fixture: ComponentFixture<UserLoanRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLoanRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLoanRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
