const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.resolve(__dirname, '../dist/driverCodePack.temp'), 'utf-8');
fs.writeFileSync(
  path.resolve(__dirname, "../src/drivers/driverCodePack.js"),
  "window.driver = " +
    JSON.stringify(
      code + `for (var k in modules) exports[k] = modules[k];`
    ) +
    ""
);
