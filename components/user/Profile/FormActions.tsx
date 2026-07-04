import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
type FormActionsProps = {
  saving: boolean
}

export function FormActions({ saving }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
      </button>
    </div>
  )
}