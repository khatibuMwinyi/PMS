export type AssignmentStatus =
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED_NO_SHOW'
  | 'AUTO_REASSIGNED'
  | 'DISPUTED';

/**
 * Shape returned by getProviderPendingAssignments().
 * PII fields (exact address, owner name) are NEVER included — isolation enforced at query layer.
 */
export interface PaginatedAssignments {
  assignments: AssignmentWithDetails[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AssignmentWithDetails {
  id:         string;
  status:     AssignmentStatus;
  expiresAt:  string;          // ISO string — safe to pass from server to client component
  version:    number;
  serviceType: {
    name:     string;
    category?: string;
  };
  property: {
    zone:     string;          // Neighbourhood only — never the encrypted address
    latitude: number;
    longitude: number;
  };
}

export interface AcceptResult {
  success:   boolean;
  conflict?: boolean;   // true → another provider won the race
  error?:    string;
}