import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserHomeComponent } from './user-home';

describe('UserHomeComponent', () => {
  let component: UserHomeComponent;
  let fixture: ComponentFixture<UserHomeComponent>;

  beforeEach(async () => {
    // Le composant lit l'utilisateur connecte via AuthService (alimente par localStorage).
    localStorage.setItem('loc_mns_token', 'header.payload.signature');
    localStorage.setItem('loc_mns_user', JSON.stringify({
      id: 1, name: 'Thomas', lastname: 'Dupont', email: 'thomas.dupont@mns.fr', role: 'COLLABORATEUR',
    }));

    await TestBed.configureTestingModule({
      imports: [UserHomeComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserHomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
