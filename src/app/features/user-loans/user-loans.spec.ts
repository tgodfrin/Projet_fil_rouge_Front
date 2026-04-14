import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLoans } from './user-loans';

describe('UserLoans', () => {
  let component: UserLoans;
  let fixture: ComponentFixture<UserLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLoans],
    }).compileComponents();

    fixture = TestBed.createComponent(UserLoans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
