// Correspond à l'entité Doc côté back
// Sérialisé via la vue DocView : id, title, url, addedDate.
// Endpoints :
//   GET    /doc/equipment/:equipmentId
//   POST   /doc
//   DELETE /doc/:id

export interface Doc {
  id: number;
  title: string;
  url: string;
  addedDate: string; // LocalDateTime côté back, chaîne ISO côté front
}

// Corps attendu par POST /doc
export interface DocCreate {
  title: string;
  url: string;
  equipmentIds: number[];
}
