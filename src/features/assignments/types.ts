export type AssignmentStatus =
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'EXPIRED'
  | 'CANCELLED_NO_SHOW';

export interface Assignment {
  id: string;
  agreementId: string;
  providerId: string;
  status: AssignmentStatus;
}
