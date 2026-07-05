import { copyFileSync, readFileSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"

copyFileSync("pnpmfile.cjs", ".pnpmfile.cjs")
execFileSync("pnpm", ["install"], { stdio: "inherit" })

const lockfilePath = "pnpm-lock.yaml"
const lockfile = readFileSync(lockfilePath, "utf8")
const updated = lockfile.replace(/^pnpmfileChecksum:.*\n/m, "")

if (updated !== lockfile) {
  writeFileSync(lockfilePath, updated)
  console.log("Removed pnpmfileChecksum from pnpm-lock.yaml (required for Liara deploy).")
}
