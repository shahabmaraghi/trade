import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"

const ROOT = path.resolve(import.meta.dirname, "..")
const envPath = path.join(ROOT, ".env")
const app = process.env.LIARA_APP || "hirmandtrade-web"
const token = process.env.LIARA_API_TOKEN

const KEYS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SEED_SECRET_KEY",
  "ZP_MERCHANT_ID",
  "TEST_MERCHANT_ID",
  "ZP_SANDBOX",
  "SMS_API_KEY",
  "SMS_LINE_NUMBER",
  "SMS_API_URL",
  "SMS_PATTERN_CODE",
  "NEXT_PUBLIC_COOKIE_DOMAIN",
  "NEXT_PUBLIC_APP_URL",
  "OPENAI_API_KEY",
  "GAPGPT_MODEL",
  "OPENAI_MODEL",
  "GAPGPT_API_KEY",
  "GAPGPT_BASE_URL",
]

function parseEnv(filePath) {
  const parsed = new Map()
  const raw = fs.readFileSync(filePath, "utf8")

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eq = trimmed.indexOf("=")
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    parsed.set(key, value)
  }

  if (!parsed.has("NEXT_PUBLIC_APP_URL")) {
    parsed.set("NEXT_PUBLIC_APP_URL", "https://hirmandtrade.ir")
  }

  return parsed
}

function runLiara(args) {
  const result = spawnSync("liara", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      ...(token ? { LIARA_API_TOKEN: token } : {}),
    },
  })

  if (result.status !== 0) {
    console.error(result.stdout || result.stderr || "Liara command failed")
    process.exit(result.status ?? 1)
  }

  return result.stdout?.trim()
}

if (!token) {
  console.error("Missing LIARA_API_TOKEN environment variable.")
  console.error("Get it from: Liara Console -> Account -> API -> Create token")
  process.exit(1)
}

if (!fs.existsSync(envPath)) {
  console.error("Missing .env file at", envPath)
  process.exit(1)
}

const env = parseEnv(envPath)

console.log(`Syncing ${KEYS.length} keys to Liara app "${app}"...`)

for (const key of KEYS) {
  const value = env.get(key)
  if (!value) {
    console.log(`skip ${key} (not in local .env)`)
    continue
  }

  console.log(`set ${key}`)
  runLiara([
    "env",
    "set",
    `${key}=${value}`,
    `--app=${app}`,
    `--api-token=${token}`,
    "--force",
  ])
}

console.log("Restarting app...")
runLiara(["app", "restart", `--app=${app}`, `--api-token=${token}`])

console.log("Done. Check: https://hirmandtrade.ir/api/health")
