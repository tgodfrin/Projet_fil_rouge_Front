import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LoanComponent } from './loan';
import { Loan, StatusLoanType } from '../../../core/models/loan.model';

// Construit un emprunt minimal pour tester la logique d'affichage du statut.
function makeLoan(statusType: StatusLoanType, beginDate: string, endDate: string): Loan {
  return {
    id: 1,
    statusType,
    beginDate,
    endDate,
    realEndDate: null,
    requester: { id: 1, name: 'Thomas', lastname: 'Dupont' },
    validator: null,
    equipment: { id: 1, reference: 'REF-PC-001', equipmentName: 'MacBook Pro' },
    groupId: null,
  } as unknown as Loan;
}

const past = new Date(Date.now() - 10 * 86_400_000).toISOString();
const future = new Date(Date.now() + 10 * 86_400_000).toISOString();
const farFuture = new Date(Date.now() + 20 * 86_400_000).toISOString();

describe('LoanComponent', () => {
  let component: LoanComponent;
  let fixture: ComponentFixture<LoanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Logique metier : getDisplayStatus (statut calcule cote front) ---

  it('un emprunt valide dont la date de fin est depassee est en RETARD', () => {
    expect(component.getDisplayStatus(makeLoan('VALID', past, past))).toBe('RETARD');
  });

  it('un emprunt valide dont le debut est dans le futur est A_VENIR', () => {
    expect(component.getDisplayStatus(makeLoan('VALID', future, farFuture))).toBe('A_VENIR');
  });

  it('un emprunt valide en cours garde le statut VALID', () => {
    expect(component.getDisplayStatus(makeLoan('VALID', past, future))).toBe('VALID');
  });

  it('un emprunt non valide renvoie son statut brut', () => {
    expect(component.getDisplayStatus(makeLoan('IN_PROGRESS', past, future))).toBe('IN_PROGRESS');
  });

  it('isRetard est vrai seulement pour un emprunt valide dont la fin est depassee', () => {
    expect(component.isRetard(makeLoan('VALID', past, past))).toBe(true);
    expect(component.isRetard(makeLoan('VALID', past, future))).toBe(false);
    expect(component.isRetard(makeLoan('IN_PROGRESS', past, past))).toBe(false);
  });
});
