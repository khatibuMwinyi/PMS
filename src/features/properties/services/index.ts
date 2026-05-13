import { prisma } from '@/core/database/client';
import { propertyRepository } from '../repositories';
import { uploadImage } from '@/core/storage/upload';

export class PropertyService {
  static async getOwnerProperties(ownerId: string) {
    return propertyRepository.findByOwner(ownerId);
  }

  static async getPropertyById(propertyId: string, ownerId?: string) {
    if (ownerId) {
      return propertyRepository.findByIdAndOwner(propertyId, ownerId);
    }
    return propertyRepository.findById(propertyId);
  }

  static async createProperty(data: {
    name: string;
    address: string;
    zone: string;
    latitude: number;
    longitude: number;
    ownerId: string;
    imageFiles?: File[];
  }) {
    // Upload images
    const imageUrls: string[] = [];
    if (data.imageFiles) {
      for (const file of data.imageFiles) {
        if (file && file.size > 0) {
          try {
            const url = await uploadImage(file, 'properties');
            imageUrls.push(url);
          } catch {
            // Non-fatal: skip failed images
          }
        }
      }
    }

    // Create property
    const property = await propertyRepository.create({
      name: data.name,
      encryptedAddress: data.address,
      zone: data.zone,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrls,
      ownerId: data.ownerId,
    });

    // Set PostGIS location
    await propertyRepository.setLocation(property.id, data.longitude, data.latitude);

    return property;
  }

  static async updatePropertyStatus(propertyId: string, status: string, ownerId: string) {
    const property = await propertyRepository.findByIdAndOwner(propertyId, ownerId);
    if (!property) {
      throw new Error('Property not found or access denied');
    }

    return propertyRepository.updateStatus(propertyId, status);
  }

  static async writeAudit(params: {
    actorId: string;
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
    oldValue?: any;
    newValue?: any;
  }) {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: params.actorId,
          entityType: params.entityType,
          entityId: params.entityId,
          action: params.action,
          oldValue: params.oldValue ?? null,
          newValue: params.newValue ?? null,
        },
      });
    } catch (error) {
      console.error('Failed to write audit event:', error);
    }
  }
}

export const propertyService = PropertyService;