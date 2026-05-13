import { prisma } from '@/core/database/client';

export class PropertyRepository {
  static async findByOwner(ownerId: string) {
    return prisma.property.findMany({
      where: { ownerId },
      include: { units: true },
    });
  }

  static async findById(propertyId: string) {
    return prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        units: true,
        owner: true,
        quotes: true,
        agreements: true,
      },
    });
  }

  static async findByIdAndOwner(propertyId: string, ownerId: string) {
    return prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      include: { units: true, quotes: true, agreements: true },
    });
  }

  static async findAllWithOwner() {
    return prisma.property.findMany({
      include: { owner: true, units: true },
    });
  }

  static async create(data: {
    name: string;
    encryptedAddress: string;
    zone: string;
    latitude: number;
    longitude: number;
    imageUrls: string[];
    ownerId: string;
  }) {
    return prisma.property.create({ data });
  }

  static async updateStatus(propertyId: string, status: string) {
    return prisma.property.update({
      where: { id: propertyId },
      data: { status: status as any },
    });
  }

  static async setLocation(propertyId: string, longitude: number, latitude: number) {
    await prisma.$executeRaw`
      UPDATE properties
      SET    location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      WHERE  id = ${propertyId}
    `;
  }
}

export const propertyRepository = PropertyRepository;