import 'server-only';
import {
  buildOwnerKpis,
  buildActivePropertyCards,
  buildRecentRequests,
} from '@/features/dashboard/services/owner-dashboard.service';
import type {
  OwnerKpis,
  OwnerPropertyCard,
  OwnerRecentRequest,
} from '@/features/dashboard/schemas/owner-dashboard.schema';

export async function getOwnerKpis(ownerUserId: string): Promise<OwnerKpis> {
  return buildOwnerKpis(ownerUserId);
}

export async function getOwnerActiveProperties(
  ownerUserId: string,
  limit: number = 4,
): Promise<OwnerPropertyCard[]> {
  return buildActivePropertyCards(ownerUserId, limit);
}

export async function getOwnerRecentRequests(
  ownerUserId: string,
  limit: number = 5,
): Promise<OwnerRecentRequest[]> {
  return buildRecentRequests(ownerUserId, limit);
}
