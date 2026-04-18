module.exports = [
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register,
    "runtime",
    ()=>runtime
]);
const runtime = 'nodejs';
async function register() {
    // Only run in Node.js runtime, skip Edge
    if ("TURBOPACK compile-time truthy", 1) {
        const { startWorker } = await __turbopack_context__.A("[project]/src/core/jobs/boss.ts [instrumentation] (ecmascript, async loader)");
        await startWorker();
    }
}
}),
];

//# sourceMappingURL=instrumentation_ts_0zq9-xz._.js.map