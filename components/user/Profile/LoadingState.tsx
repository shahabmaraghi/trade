import { Loader2 } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        در حال دریافت اطلاعات پروفایل...
      </div>
    </div>
  )
}