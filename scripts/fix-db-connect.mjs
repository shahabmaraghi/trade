import fs from "fs"
import path from "path"

const apiRoot = path.join(process.cwd(), "app", "api")

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    } else if (entry.name === "route.ts") {
      files.push(fullPath)
    }
  }

  return files
}

const connectPattern =
  /^(\s*)await connect(?:DB|ToDatabase)\(\);?\r?\n/gm

const replacement =
  "$1const dbError = await connectDBOr503()\n$1if (dbError) return dbError\n"

for (const file of walk(apiRoot)) {
  let content = fs.readFileSync(file, "utf8")
  const original = content

  if (!content.includes("connectDB") && !content.includes("connectToDatabase")) {
    continue
  }

  content = content.replace(
    /import \{ connectToDatabase \} from "@\/lib\/db";?\r?\n/g,
    'import { connectDBOr503 } from "@/lib/db"\n',
  )
  content = content.replace(
    /import \{ connectDB \} from "@\/lib\/db";?\r?\n/g,
    'import { connectDBOr503 } from "@/lib/db"\n',
  )
  content = content.replace(
    /import \{ connectDB, type/g,
    'import { connectDBOr503, type',
  )
  content = content.replace(
    /, connectDB \} from "@\/lib\/db"/g,
    ', connectDBOr503 } from "@/lib/db"',
  )

  if (file.endsWith(`${path.sep}health${path.sep}route.ts`)) {
    if (content !== original) {
      fs.writeFileSync(file, content)
      console.log("import only", path.relative(process.cwd(), file))
    }
    continue
  }

  content = content.replace(connectPattern, replacement)

  if (content !== original) {
    fs.writeFileSync(file, content)
    console.log("updated", path.relative(process.cwd(), file))
  }
}
