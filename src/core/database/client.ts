import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '@/core/security/encryption';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      user: {
        async create({ args, query }) {
          if (args.data.phone) {
            args.data.phone = encrypt(args.data.phone);
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.data.phone && typeof args.data.phone === 'string') {
            args.data.phone = encrypt(args.data.phone);
          }
          return query(args);
        },
      },
      ownerProfile: {
        async create({ args, query }) {
          if (args.data.encryptedId) {
            args.data.encryptedId = encrypt(args.data.encryptedId);
          }
          if (args.data.encryptedAddress) {
            args.data.encryptedAddress = encrypt(args.data.encryptedAddress);
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.data.encryptedId && typeof args.data.encryptedId === 'string') {
            args.data.encryptedId = encrypt(args.data.encryptedId);
          }
          if (args.data.encryptedAddress && typeof args.data.encryptedAddress === 'string') {
            args.data.encryptedAddress = encrypt(args.data.encryptedAddress);
          }
          return query(args);
        },
      },
      property: {
        async create({ args, query }) {
          if (args.data.encryptedAddress) { // Use encryptedAddress field
            args.data.encryptedAddress = encrypt(args.data.encryptedAddress);
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.data.encryptedAddress && typeof args.data.encryptedAddress === 'string') {
            args.data.encryptedAddress = encrypt(args.data.encryptedAddress);
          }
          return query(args);
        },
      },
    },
    result: {
      user: {
        phone: {
          needs: { phone: true },
          compute(user) {
            try {
              return decrypt(user.phone);
            } catch (e) {
              return user.phone;
            }
          },
        },
      },
      ownerProfile: {
        encryptedId: {
          needs: { encryptedId: true },
          compute(ownerProfile) {
            try {
              return ownerProfile.encryptedId ? decrypt(ownerProfile.encryptedId) : null;
            } catch (e) {
              return ownerProfile.encryptedId;
            }
          },
        },
        encryptedAddress: {
          needs: { encryptedAddress: true },
          compute(ownerProfile) {
            try {
              return ownerProfile.encryptedAddress ? decrypt(ownerProfile.encryptedAddress) : null;
            } catch (e) {
              return ownerProfile.encryptedAddress;
            }
          },
        },
      },
      property: {
        encryptedAddress: {
          needs: { encryptedAddress: true },
          compute(property) {
            try {
              return decrypt(property.encryptedAddress);
            } catch (e) {
              return property.encryptedAddress;
            }
          },
        },
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };