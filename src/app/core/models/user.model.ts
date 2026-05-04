// Correspond à l'entité AppUser côté back
// Sérialisé via @JsonView(AppUserView)
// Endpoints :
//   GET  /user/list
//   GET  /user/:id
//   POST /user
//   PUT  /user/:id/email?email=...
//   PUT  /user/:id/password?password=...

import { Profil, ProfilType } from './profil.model';

export interface AppUser {
  id: number;
  email: string;
  name: string;
  lastname: string;
  createdAt: string; // LocalDateTime → ISO string (@CreationTimestamp)
  profil: Profil;
}

// Body attendu par POST /user
export interface AppUserCreate {
  email: string;
  name: string;
  lastname: string;
  password: string;
  profil: { id: number };
}

// ── Alias de compatibilité UI ─────────────────────────
// Utilisés par les composants mockés — à supprimer au fur et à mesure du branchement

/** @deprecated Utiliser ProfilType depuis profil.model.ts */
export type UserRole = ProfilType;

/** @deprecated Utiliser AppUser */
export interface User extends AppUser {}
