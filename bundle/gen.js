const fs = require('fs');
const code = fs.readFileSync('./driver.js', 'utf-8');
fs.writeFileSync(
  "./driver.code.js",
  "window.driver = " +
    JSON.stringify(
      `let modules =` + code + `for (var k in modules) exports[k] = modules[k];`
    ) +
    ""
);

fs.writeFileSync(
  '../src/copied/driver.js',
  'window.driver = ' +
    JSON.stringify(
      `let modules =` + code + `for (var k in modules) exports[k] = modules[k];`
    ) +
    ''
)