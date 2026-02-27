#!/usr/bin/env node
// scripts/hash-password.mjs
// Uso:  node scripts/hash-password.mjs "mi-nueva-contraseña"
// Genera el hash bcrypt para pegarlo en data/users.json

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("❌  Uso: node scripts/hash-password.mjs \"mi-contraseña\"");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\n✅  Hash generado:");
console.log(hash);
console.log('\nPégalo en data/users.json como el campo "passwordHash"\n');
