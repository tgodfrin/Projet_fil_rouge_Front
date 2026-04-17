import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIncidentComponent } from './user-incident';

describe('UserIncident', () => {
  let component: UserIncidentComponent

  let fixture: ComponentFixture<UserIncidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserIncidentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserIncidentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
