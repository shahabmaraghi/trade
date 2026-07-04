import { CheckCircle2, XCircle } from "lucide-react"

type AlertMessageProps = {
  type: "success" | "error"
  text: string
}

export function AlertMessage({ type, text }: AlertMessageProps) {
  return (
    <div
      className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5" />
      ) : (
        <XCircle className="h-5 w-5" />
      )}

      {text}
    </div>
  )
}