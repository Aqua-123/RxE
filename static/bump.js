const RELEASES_REPO_NAME = "Public-Releases";
const RELEASES_LOCATION = `../${RELEASES_REPO_NAME}`;
const RELEASES_OLD = `${RELEASES_LOCATION}/Previous Versions`;
const RELEASE_BUILT = `dist`;
const RELEASES_META = `${RELEASES_LOCATION}/meta`;

const RELEASE_UNIVERSAL = "ritsu-emerald.user.js";
const RELEASE_NAMED = (ver) => `Ritsu x Emerald.${ver}.user.js`;
const VERSION_FILE = "VERSION";
const USAGE_STRING = `
Usage:
\tyarn bump <new-version>

Description: 

\tThis script prepares a new version release:

\t1. Version change is applied and committed.
\t2. Userscript is built using \`yarn prod\`.
\t3. Release repository is updated with new userscript.

\tDoes not perform git operations on release repository.
`;

const fs = require("fs");
const { promisify } = require("util");
const childProcess = require("child_process");

const exec = promisify(childProcess.exec);
const { spawn } = childProcess;

const newVersion = process.argv[2];

(async function main() {
  // Phase 0: Check pre-requisites

  if (typeof newVersion === "undefined") {
    console.error(USAGE_STRING);
    process.exit(1);
  }

  if (!fs.existsSync(RELEASES_LOCATION)) {
    console.error(`Missing adjacent releases repo ('${RELEASES_LOCATION}').`);
    process.exit(1);
  }

  const gitStatus = await exec("git status --porcelain=v1");

  if (gitStatus.stdout.length > 1) {
    console.error("\nCannot commit version bump.\n");
    console.error("Please resolve the following changes before proceeding:\n");
    console.error(gitStatus.stdout);
    process.exit(1);
  }

  // Phase 1: Modify version numbers

  const packageSpec = JSON.parse(fs.readFileSync("package.json"));

  if (typeof packageSpec.version !== "string") {
    console.error("Could not read package.json");
    process.exit(1);
  }
  packageSpec.version = newVersion;

  /** @type {string | null} */
  let oldVersion = null;
  const userscriptSpec = fs
    .readFileSync("src/userscript.ts")
    .toString()
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*)version: "([0-9.]+)",(.+)/);
      if (!match) return line;
      const whitespace = match[1];
      // eslint-disable-next-line prefer-destructuring
      oldVersion = match[2];
      const tail = match[3];
      return `${whitespace}version: "${newVersion}",${tail}`;
    })
    .join("\n");

  if (!oldVersion) {
    console.error("Could not update src/userscript.ts");
    process.exit(1);
  }

  fs.writeFileSync("package.json", JSON.stringify(packageSpec, null, 2));
  fs.writeFileSync("src/userscript.ts", userscriptSpec);

  console.log("Version updated in package.json and src/userscript.ts");

  // Phase 2: Commit version change

  await exec("git add package.json src/userscript.ts");
  try {
    await exec(`git commit -m 'Bump to v${newVersion}' [auto]`);
  } catch (_) {
    // ignore empty commits
  }

  // Phase 3: Build userscript

  await new Promise((resolve) => {
    const compilation = spawn("yarn", ["prod"]).on("exit", (code, signal) => {
      if (code || signal) {
        console.error("Version bump failed: Could not compile.");
        process.exit(code || 1);
      }
      resolve();
    });
    compilation.stdout.pipe(process.stdout);
    compilation.stderr.pipe(process.stderr);
  });

  // Phase 4: Move files

  const OLD_RELEASE_FROM = `${RELEASES_LOCATION}/${RELEASE_NAMED(oldVersion)}`;
  const OLD_RELEASE_TO = `${RELEASES_OLD}/${RELEASE_NAMED(oldVersion)}`;

  const NEW_RELEASE_FROM = `${RELEASE_BUILT}/${RELEASE_UNIVERSAL}`;
  const NEW_RELEASE_UNIVERSAL = `${RELEASES_LOCATION}/${RELEASE_UNIVERSAL}`;
  const NEW_RELEASE_NAMED = `${RELEASES_LOCATION}/${RELEASE_NAMED(newVersion)}`;
  if (fs.fileExists(OLD_RELEASE_FROM)) {
    fs.renameSync(OLD_RELEASE_FROM, OLD_RELEASE_TO);
  } else {
    console.log(
      "Could not locate old release: please move to 'Previous Versions' folder manually."
    );
  }
  fs.copyFileSync(NEW_RELEASE_FROM, NEW_RELEASE_UNIVERSAL);
  fs.copyFileSync(NEW_RELEASE_FROM, NEW_RELEASE_NAMED);

  try {
    fs.mkdirSync(RELEASES_META);
  } catch (_) {
    // ignore existing folder
  }

  fs.writeFileSync(`${RELEASES_META}/${VERSION_FILE}`, newVersion);

  console.log(`Updated files in release directory to v${newVersion}`);
})();
