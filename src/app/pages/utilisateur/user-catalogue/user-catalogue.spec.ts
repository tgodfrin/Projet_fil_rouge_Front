import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { UserCatalogueComponent } from './user-catalogue';

describe('UserCatalogueComponent', () => {
  let component: UserCatalogueComponent;
  let fixture: ComponentFixture<UserCatalogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCatalogueComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCatalogueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
