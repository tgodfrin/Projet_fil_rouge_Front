// Correspond à l'entité AppUser côté back, sérialisée via la vue AppUserView.
// Endpoints associés : liste et détail des utilisateurs, création, mise à jour
// de l'email et du mot de passe (les identifiants passent par le corps de la requête, pas par l'URL).

import { Profil, ProfilType } from './profil.model';

export interface AppUser {
  id: number;
  email: string;
  name: string;
  lastname: string;
  createdAt: string; // LocalDateTime côté back (rempli à la création), chaîne ISO côté front
  profil: Profil;
}

// Corps attendu par POST /user
export interface AppUserCreate {
  email: string;
  name: string;
  lastname: string;
  password: string;
  profilId: number;
}
