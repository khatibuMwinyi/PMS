import { prisma } from '@/core/database/client';
import type { AssignmentStatus } from '@prisma/client';

export class AssignmentRepository {
  static async findByProvider(providerId: string, status?: AssignmentStatus) {
    return prisma.assignment.findMany({
      where: { providerId, ...(status ? { status } : {}) },
      include: { property: true, agreement: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findById(assignmentId: string) {
    return prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { property: true, agreement: true, provider: true },
    });
  }

  static async findPending(providerId: string, page: number = 1, pageSize: number = 20) {
    const where = {
      providerId,
      status: 'PENDING_ACCEPTANCE' as AssignmentStatus,
      expiresAt: { gt: new Date() },
    };
    const total = await prisma.assignment.count({ where });
    const skip = (page - 1) * pageSize;
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        property: { select: { id: true, name: true, zone: true } },
        agreement: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });
    return { assignments, total, page, pageSize };
  }

  static async updateStatus(assignmentId: string, status: AssignmentStatus) {
    return prisma.assignment.update({
      where: { id: assignmentId },
      data: { status, transitionedAt: new Date() },
    });
  }
}

export const assignmentRepository = AssignmentRepository;