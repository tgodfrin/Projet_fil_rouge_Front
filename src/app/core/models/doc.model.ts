// Correspond à l'entité Doc côté back
// Sérialisé via @JsonView(DocView) → id, title, url, addedDate
// Note : le champ `equipments` de l'entité n'a pas de @JsonView → non exposé dans les réponses API
// Endpoints :
//   GET    /doc/equipment/:equipmentId
//   POST   /doc
//   DELETE /doc/:id

export interface Doc {
  id: number;
  title: string;
  url: string;
  addedDate: string; // LocalDateTime → ISO string
}

// Body attendu par POST /doc
export interface DocCreate {
  title: string;
  url: string;
  equipments: { id: number }[];
}
