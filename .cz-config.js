const path = require("path");
const glob = require("glob");

const types = require("conventional-commit-types").types;
const longest = Math.max(...Object.keys(types).map((type) => [...type].length));

function getPackages(ctx) {
  const cwd = ctx ? ctx.cwd : process.cwd();
  const packageJson = require(path.join(cwd, "package.json"));
  if (packageJson && Array.isArray(packageJson.workspaces)) {
    return packageJson.workspaces
      .map((ws) => glob.sync(path.join(ws, "package.json"), { cwd })).flat()
      .map(packageJson => require(path.join(cwd, packageJson)))
      .map((pkg) => pkg.name)
      .map((name) => (name.charAt(0) === "@" ? name.split("/")[1] : name));
  }
  return [];
}

module.exports = {
  types: Object.entries(types).map(([type, { description }]) => ({
    value: type,
    name: `${type.padEnd(longest)}  ${description}`,
  })),
  scopes: getPackages(),

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  ticketNumberPrefix: "TICKET-",
  ticketNumberRegExp: "\\d{1,5}",

  // it needs to match the value for field type. Eg.: 'fix'
  /*
    scopeOverrides: {
      fix: [
  
        {name: 'merge'},
        {name: 'style'},
        {name: 'e2eTest'},
        {name: 'unitTest'}
      ]
    },
    */
  // override the messages, defaults are as follows
  messages: {
    type: "Select the type of change that you're committing:",
    scope: "\nDenote the SCOPE of this change (optional):",
    // used if allowCustomScopes is true
    subject: "Write a SHORT, IMPERATIVE tense description of the change:\n",
    body:
      'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
    breaking: "List any BREAKING CHANGES (optional):\n",
    footer:
      "List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n",
    confirmCommit: "Are you sure you want to proceed with the commit above?",
  },

  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix"],
  // skip any questions you want
  skipQuestions: ["body"],

  // limit subject length
  subjectLimit: 100,
  // breaklineChar: '|', // It is supported for fields body and footer.
  // footerPrefix : 'ISSUES CLOSED:'
  // askForBreakingChangeFirst : true, // default is false
};
