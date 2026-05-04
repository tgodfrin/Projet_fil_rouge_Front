// Correspond aux entités CharacteristicValue + Characteristic côté back
// Sérialisé via @JsonView(CharacteristicValueView)
// Note : le champ `equipments` de l'entité n'a pas de @JsonView → non exposé dans les réponses API
// Endpoints :
//   GET  /characteristic-value/equipment/:equipmentId
//   POST /characteristic-value

export interface Characteristic {
  id: number;
  name: string;
}

export interface CharacteristicValue {
  id: number;
  value: string;
  beginDate: string;         // LocalDateTime → ISO string
  endDate: string | null;    // null si toujours en vigueur
  characteristic: Characteristic;
}

// Body attendu par POST /characteristic-value
export interface CharacteristicValueCreate {
  value: string;
  characteristic: { id: number };
  equipments: { id: number }[];
}
