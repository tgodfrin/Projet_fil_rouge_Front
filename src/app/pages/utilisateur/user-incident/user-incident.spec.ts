import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { UserIncidentComponent } from './user-incident';

describe('UserIncidentComponent', () => {
  let component: UserIncidentComponent;
  let fixture: ComponentFixture<UserIncidentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserIncidentComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        // Le composant lit un :id dans l'URL : on fournit un paramMap factice.
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserIncidentComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
