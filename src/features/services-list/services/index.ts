import 'server-only';
import { AgreementStatus, AssignmentStatus } from '@prisma/client';
import {
  findOwnerServices,
  countOwnerKpiBuckets,
} from '../repositories';
import type {
  OwnerServiceRow,
  OwnerServiceKpis,
  OwnerServiceStatus,
} from '../schemas';

function mapToOwnerStatus(
  agreementStatus: AgreementStatus,
  assignmentStatus: AssignmentStatus | null,
): OwnerServiceStatus {
  if (assignmentStatus) {
    switch (assignmentStatus) {
      case AssignmentStatus.PENDING_ACCEPTANCE: return 'PENDING_ACCEPTANCE';
      case AssignmentStatus.ACCEPTED:
      case AssignmentStatus.SCHEDULED: return 'SCHEDULED';
      case AssignmentStatus.IN_PROGRESS: return 'IN_PROGRESS';
      case AssignmentStatus.COMPLETED:
      case AssignmentStatus.VERIFIED: return 'COMPLETED';
      case AssignmentStatus.DISPUTED: return 'DISPUTED';
      case AssignmentStatus.EXPIRED:
      case AssignmentStatus.REJECTED:
      case AssignmentStatus.AUTO_REASSIGNED:
      case AssignmentStatus.NO_PROVIDER_AVAILABLE:
        return 'PENDING_ASSIGNMENT';
      case AssignmentStatus.CANCELLED_BY_OWNER:
      case AssignmentStatus.CANCELLED_NO_SHOW:
        return 'CANCELLED';
      default:
        return 'PENDING_ASSIGNMENT';
    }
  }
  switch (agreementStatus) {
    case AgreementStatus.QUOTED:
    case AgreementStatus.PENDING_ASSIGNMENT: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.ACTIVE: return 'SCHEDULED';
    case AgreementStatus.SUSPENDED: return 'PENDING_ASSIGNMENT';
    case AgreementStatus.CANCELLED: return 'CANCELLED';
    case AgreementStatus.COMPLETED: return 'COMPLETED';
    default: return 'PENDING_ASSIGNMENT';
  }
}

export async function getOwnerServiceList(
  ownerUserId: string,
): Promise<OwnerServiceRow[]> {
  const rows = await findOwnerServices(ownerUserId);
  return rows.map((r) => ({
    agreementId: r.agreementId,
    shortRef: `SRV-${r.agreementId.slice(-6).toUpperCase()}`,
    propertyName: r.propertyName,
    serviceTypeName: r.serviceTypeName,
    status: mapToOwnerStatus(r.agreementStatus, r.assignmentStatus),
    createdAt: r.createdAt,
    formattedDate: r.createdAt.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      timeZone: 'Africa/Dar_es_Salaam',
    }),
    hrefDetail: `/owner/services/${r.agreementId}`,
  }));
}

export async function getOwnerServiceKpis(
  ownerUserId: string,
): Promise<OwnerServiceKpis> {
  return countOwnerKpiBuckets(ownerUserId);
}
