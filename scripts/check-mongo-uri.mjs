import fs from "fs"

const env = fs.readFileSync(".env", "utf8")
const line = env.split(/\r?\n/).find((l) => l.startsWith("MONGODB_URI="))

if (!line) {
  console.log("MONGODB_URI not found in .env")
  process.exit(1)
}

const uri = line.slice("MONGODB_URI=".length).trim().replace(/^["']|["']$/g, "")

try {
  const normalized = uri.replace(/^mongodb\+srv:/, "https:").replace(/^mongodb:/, "http:")
  const url = new URL(normalized)

  const host = url.hostname
  const isPublicLiara = host.endsWith(".liara.cloud")
  const isLocalhost = host === "localhost" || host === "127.0.0.1"

  console.log(
    JSON.stringify(
      {
        host,
        port: url.port || "(default)",
        database: url.pathname.replace(/^\//, "") || "(none)",
        hasUsername: Boolean(url.username),
        authSource: url.searchParams.get("authSource") || "(none)",
        connectionType: isLocalhost
          ? "LOCALHOST (will NOT work in Liara Docker)"
          : isPublicLiara
            ? "PUBLIC Liara network (*.liara.cloud)"
            : "PRIVATE network (database ID as host)",
        liaraNote: isPublicLiara
          ? "Works locally. In production Docker, prefer private network string from Liara console."
          : isLocalhost
            ? "Must replace with Liara connection string."
            : "Likely correct format for Liara private network.",
      },
      null,
      2,
    ),
  )
} catch (error) {
  console.error("Failed to parse MONGODB_URI:", error.message)
  process.exit(1)
}
