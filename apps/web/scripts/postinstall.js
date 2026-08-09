// Intentionally empty.
// Previous TypeScript 7 + @typescript/typescript6 shims broke eslint/Next
// once typescript-eslint rejected TS 7. Keep the script so package.json
// "postinstall" stays valid for Coolify/Nixpacks without mutating node_modules.
console.log('[postinstall] no-op (TypeScript 6 — no TS7 shim)');
