module.exports = [
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/core/security/encryption.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decrypt",
    ()=>decrypt,
    "encrypt",
    ()=>encrypt
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';
function getKey(salt) {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) throw new Error('ENCRYPTION_SECRET not set');
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, DIGEST);
}
function encrypt(text) {
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(IV_LENGTH);
    const salt = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(SALT_LENGTH);
    const key = getKey(salt);
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([
        salt,
        iv,
        authTag,
        encrypted
    ]).toString('base64');
}
function decrypt(encryptedData) {
    const data = Buffer.from(encryptedData, 'base64');
    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const key = getKey(salt);
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
}
}),
"[project]/src/core/database/client.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/security/encryption.ts [instrumentation] (ecmascript)");
;
;
const prismaClientSingleton = ()=>{
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]().$extends({
        query: {
            user: {
                async create ({ args, query }) {
                    if (args.data.phone) {
                        args.data.phone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.phone);
                    }
                    return query(args);
                },
                async update ({ args, query }) {
                    if (args.data.phone && typeof args.data.phone === 'string') {
                        args.data.phone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.phone);
                    }
                    return query(args);
                }
            },
            ownerProfile: {
                async create ({ args, query }) {
                    if (args.data.encryptedId) {
                        args.data.encryptedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedId);
                    }
                    if (args.data.encryptedAddress) {
                        args.data.encryptedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedAddress);
                    }
                    return query(args);
                },
                async update ({ args, query }) {
                    if (args.data.encryptedId && typeof args.data.encryptedId === 'string') {
                        args.data.encryptedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedId);
                    }
                    if (args.data.encryptedAddress && typeof args.data.encryptedAddress === 'string') {
                        args.data.encryptedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedAddress);
                    }
                    return query(args);
                }
            },
            property: {
                async create ({ args, query }) {
                    if (args.data.encryptedAddress) {
                        args.data.encryptedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedAddress);
                    }
                    return query(args);
                },
                async update ({ args, query }) {
                    if (args.data.encryptedAddress && typeof args.data.encryptedAddress === 'string') {
                        args.data.encryptedAddress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["encrypt"])(args.data.encryptedAddress);
                    }
                    return query(args);
                }
            }
        },
        result: {
            user: {
                phone: {
                    needs: {
                        phone: true
                    },
                    compute (user) {
                        try {
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(user.phone);
                        } catch (e) {
                            return user.phone;
                        }
                    }
                }
            },
            ownerProfile: {
                encryptedId: {
                    needs: {
                        encryptedId: true
                    },
                    compute (ownerProfile) {
                        try {
                            return ownerProfile.encryptedId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(ownerProfile.encryptedId) : null;
                        } catch (e) {
                            return ownerProfile.encryptedId;
                        }
                    }
                },
                encryptedAddress: {
                    needs: {
                        encryptedAddress: true
                    },
                    compute (ownerProfile) {
                        try {
                            return ownerProfile.encryptedAddress ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(ownerProfile.encryptedAddress) : null;
                        } catch (e) {
                            return ownerProfile.encryptedAddress;
                        }
                    }
                }
            },
            property: {
                encryptedAddress: {
                    needs: {
                        encryptedAddress: true
                    },
                    compute (property) {
                        try {
                            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$security$2f$encryption$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["decrypt"])(property.encryptedAddress);
                        } catch (e) {
                            return property.encryptedAddress;
                        }
                    }
                }
            }
        }
    });
};
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
;
}),
"[project]/src/features/assignments/actions.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "acceptAssignment",
    ()=>acceptAssignment,
    "reassignAssignment",
    ()=>reassignAssignment
]);
async function reassignAssignment(assignmentId) {
    // TODO: implement tiered reassignment logic for expired offers
    console.warn('reassignAssignment is not implemented yet for assignment', assignmentId);
}
async function acceptAssignment(assignmentId) {
    // TODO: implement optimistic concurrency for assignment acceptance
    return {
        success: true
    };
}
}),
"[project]/src/core/jobs/workers/assignment-expiration.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assignmentExpirationWorker",
    ()=>assignmentExpirationWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/database/client.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$assignments$2f$actions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/assignments/actions.ts [instrumentation] (ecmascript)");
;
;
const assignmentExpirationWorker = {
    name: 'assignment-expiration',
    handler: async ()=>{
        const expiredAssignments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prisma"].assignment.findMany({
            where: {
                status: 'PENDING_ACCEPTANCE',
                expiresAt: {
                    lt: new Date()
                }
            },
            select: {
                id: true
            }
        });
        for (const assignment of expiredAssignments){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$assignments$2f$actions$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["reassignAssignment"])(assignment.id);
        }
    }
};
}),
"[project]/src/core/jobs/workers/financial-reconciliation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "financialReconciliationWorker",
    ()=>financialReconciliationWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/database/client.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/.pnpm/@prisma+client@5.22.0_prisma@5.22.0/node_modules/@prisma/client)");
;
;
const financialReconciliationWorker = {
    name: 'financial-reconciliation',
    handler: async ()=>{
        const wallets = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prisma"].wallet.findMany();
        for (const wallet of wallets){
            // SUM the amounts in WalletTransaction where status is SETTLED
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prisma"].walletTransaction.aggregate({
                where: {
                    walletId: wallet.id,
                    status: 'SETTLED'
                },
                _sum: {
                    amount: true
                }
            });
            const ledgerSum = result._sum.amount || new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$prisma$2b$client$40$5$2e$22$2e$0_prisma$40$5$2e$22$2e$0$2f$node_modules$2f40$prisma$2f$client$29$__["Decimal"](0);
            // Compare against availableBalance
            if (!wallet.availableBalance.equals(ledgerSum)) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$database$2f$client$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["prisma"].reconciliationAlert.create({
                    data: {
                        walletId: wallet.id,
                        ledgerSum,
                        actualBalance: wallet.availableBalance
                    }
                });
            }
        }
    }
};
}),
"[project]/src/core/jobs/workers/index.ts [instrumentation] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$assignment$2d$expiration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/jobs/workers/assignment-expiration.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$financial$2d$reconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/jobs/workers/financial-reconciliation.ts [instrumentation] (ecmascript)");
;
;
}),
"[project]/src/core/jobs/boss.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "boss",
    ()=>boss,
    "startWorker",
    ()=>startWorker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$2d$boss$40$8$2e$4$2e$2$2f$node_modules$2f$pg$2d$boss$2f$src$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/pg-boss@8.4.2/node_modules/pg-boss/src/index.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$index$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/core/jobs/workers/index.ts [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$assignment$2d$expiration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/jobs/workers/assignment-expiration.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$financial$2d$reconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/core/jobs/workers/financial-reconciliation.ts [instrumentation] (ecmascript)");
;
;
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
}
const boss = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$pg$2d$boss$40$8$2e$4$2e$2$2f$node_modules$2f$pg$2d$boss$2f$src$2f$index$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["default"](process.env.DATABASE_URL);
boss.on('error', (error)=>console.error('pg-boss error:', error));
async function startWorker() {
    await boss.start();
    await boss.work(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$assignment$2d$expiration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assignmentExpirationWorker"].name, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$assignment$2d$expiration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assignmentExpirationWorker"].handler);
    await boss.work(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$financial$2d$reconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReconciliationWorker"].name, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$financial$2d$reconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReconciliationWorker"].handler);
    await boss.schedule(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$assignment$2d$expiration$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["assignmentExpirationWorker"].name, '* * * * *');
    await boss.schedule(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$core$2f$jobs$2f$workers$2f$financial$2d$reconciliation$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["financialReconciliationWorker"].name, '0 0 * * *');
    console.log('OPSMP Job Worker Initialized');
}
;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__01i5ba-._.js.map