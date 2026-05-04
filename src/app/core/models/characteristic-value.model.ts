// Correspond aux entités CharacteristicValue + Characteristic côté back
// Sérialisé via @JsonView(CharacteristicValueView)
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
