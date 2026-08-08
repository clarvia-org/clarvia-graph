const fs = require('fs');
const path = require('path');

const tsDir = path.resolve(__dirname, '../node_modules/typescript');
if (fs.existsSync(tsDir)) {
  const libDir = path.join(tsDir, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Write a nested package.json inside lib/ to force CommonJS mode for typescript.js
  const libPkgPath = path.join(libDir, 'package.json');
  fs.writeFileSync(
    libPkgPath,
    JSON.stringify({ type: 'commonjs' }, null, 2) + '\n'
  );
  console.log('[postinstall] Created typescript/lib/package.json');

  // 1. Write lib/typescript.js to re-export @typescript/typescript6
  const tsJsPath = path.join(libDir, 'typescript.js');
  fs.writeFileSync(
    tsJsPath,
    `module.exports = require('@typescript/typescript6');\n`
  );
  console.log('[postinstall] Created typescript/lib/typescript.js shim');

  // 2. Modify lib/version.cjs to re-export @typescript/typescript6
  const versionCjsPath = path.join(libDir, 'version.cjs');
  if (fs.existsSync(versionCjsPath)) {
    const versionCjsContent = `const { version } = require("../package.json");
const ts6 = require('@typescript/typescript6');
module.exports = {
  ...ts6,
  version,
  versionMajorMinor: "7.0"
};\n`;
    fs.writeFileSync(versionCjsPath, versionCjsContent);
    console.log('[postinstall] Shimmed typescript/lib/version.cjs');
  }
} else {
  console.log('[postinstall] typescript package not found in node_modules');
}
