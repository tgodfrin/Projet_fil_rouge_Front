// Correspond à l'enum ProfilType + l'entité Profil côté back
// Sérialisé via @JsonView(AppUserView) → id + type
// Endpoint : GET /profil/list

export type ProfilType = 'GESTIONNAIRE' | 'COLLABORATEUR' | 'INTERVENANT' | 'STAGIAIRE';

export interface Profil {
  id: number;
  type: ProfilType;
}
