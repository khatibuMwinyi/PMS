import { prisma } from '@/core/database/client';
import { serviceRepository, type ProviderWithScore } from '../repositories';

export class ServiceService {
  static async findBestProvider(
    propertyId: string,
    serviceTypeId: string,
    radiusKm: number = 10,
    minScoreThreshold: number = 0,
    scheduledDate?: Date,
  ): Promise<ProviderWithScore | null> {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { latitude: true, longitude: true }
    });
    if (!property) throw new Error("Property not found");

    const serviceType = await prisma.serviceType.findUnique({
      where: { id: serviceTypeId },
      select: { name: true }
    });
    if (!serviceType) throw new Error("Service type not found");

    const result = await serviceRepository.findBestProvider(
      propertyId,
      serviceTypeId,
      radiusKm,
      scheduledDate,
    );
    if (result && result.score >= minScoreThreshold) {
      return result;
    }
    return null;
  }

  static async acceptAssignment(assignmentId: string, providerId: string) {
    return await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.findUnique({ where: { id: assignmentId } });

      if (!assignment || assignment.status !== 'PENDING_ACCEPTANCE') {
        throw new Error("Assignment no longer available");
      }

      const updated = await tx.assignment.updateMany({
        where: {
          id: assignmentId,
          version: assignment.version,
          status: 'PENDING_ACCEPTANCE'
        },
        data: {
          status: 'ACCEPTED',
          providerId,
          transitionedAt: new Date(),
          version: { increment: 1 }
        }
      });

      if (updated.count === 0) {
        throw new Error("Conflict: Assignment accepted by another provider.");
      }
      return { success: true };
    });
  }
}

export const serviceService = ServiceService;