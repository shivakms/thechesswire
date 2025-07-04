// scripts/init-folders.js

const fs = require("fs");
const path = require("path");

const base = path.resolve(__dirname, "../");

const folders = [
  "app/onboarding",
  "app/terms",
  "app/privacy",
  "app/admin",
  "public/assets/logo",
  "public/assets/favicon",
  "public/assets/bg",
  "src/components/ui",
  "src/lib/security",
  "src/lib/ui",
  "src/styles",
  "src/types",
];

folders.forEach((folder) => {
  const fullPath = path.join(base, folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log("📁 Created:", folder);
  } else {
    console.log("✅ Exists:", folder);
  }
});
