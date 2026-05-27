// Correspond à l'entité Loan + l'enum StatusLoanType côté back
// Sérialisé via @JsonView(LoanView)
// Endpoints :
//   GET  /loan/list
//   GET  /loan/:id
//   GET  /loan/user/:userId
//   GET  /loan/planning?begin=...&end=...
//   POST /loan
//   PUT  /loan/:id/validate  (validatorId lu depuis le token JWT côté back)
//   PUT  /loan/:id/invalidate
//   PUT  /loan/:id/return

// Enum StatusLoanType côté back — RETARD n'est pas un statut en base, c'est un état calculé
// côté front (loan VALID dont endDate est dépassée)
export type StatusLoanType = 'VALID' | 'INVALID' | 'IN_PROGRESS' | 'TERMINE';

// Sous-objet AppUser dans Loan — champs exposés via @JsonView(LoanView) dans AppUser
export interface LoanUser {
  id: number;
  name: string;
  lastname: string;
}

// Sous-objet EquipmentFamily dans Loan — seul l'id est exposé en LoanView
export interface LoanEquipmentFamily {
  id: number;
}

// Sous-objet Equipment dans Loan — champs exposés via @JsonView(LoanView) dans Equipment
export interface LoanEquipment {
  id: number;
  reference: string;
  equipmentName: string;
  equipmentFamily: LoanEquipmentFamily;
}

export interface Loan {
  id: number;
  beginDate: string;            // LocalDateTime → ISO string
  endDate: string;
  realEndDate: string | null;   // null jusqu'au retour effectif
  statusType: StatusLoanType;
  statusDate: string;           // date du dernier changement de statut
  requester: LoanUser;
  validator: LoanUser | null;   // null jusqu'à validation/refus
  equipment: LoanEquipment;
  groupId: string | null;       // UUID shared by grouped loans, null for individual loans
}

// Body attendu par POST /loan
export interface LoanCreate {
  beginDate: string;
  endDate: string;
  requesterId: number;
  equipmentId: number;
  groupId?: string;             // optional — set when submitting grouped requests
}
