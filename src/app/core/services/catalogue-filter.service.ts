import { Injectable, signal } from '@angular/core';

/**
 * Persists the catalogue date filter across navigation.
 * When the user goes to UserCatalogueDetail and comes back,
 * the selected dates are preserved.
 */
@Injectable({ providedIn: 'root' })
export class CatalogueFilterService {
  startDate = signal<string | null>(null);
  endDate   = signal<string | null>(null);
}
