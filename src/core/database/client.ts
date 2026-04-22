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
      property: {
        async create({ args, query }) {
          if (args.data.encryptedAddress) {
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