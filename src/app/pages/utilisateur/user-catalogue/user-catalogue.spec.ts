import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCatalogue } from './user-catalogue';

describe('UserCatalogue', () => {
  let component: UserCatalogue;
  let fixture: ComponentFixture<UserCatalogue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCatalogue],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCatalogue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
