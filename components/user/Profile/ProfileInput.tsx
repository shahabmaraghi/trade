import type { ReactNode } from "react"

type ProfileInputProps = {
  label: string
  value: string
  placeholder?: string
  icon?: ReactNode
  disabled?: boolean
  onChange: (value: string) => void
}

export function ProfileInput({
  label,
  value,
  placeholder,
  icon,
  disabled = false,
  onChange,
}: ProfileInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-200">
        {label}
      </span>

      <div
        className={[
          "flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-[#111827]",
          disabled ? "opacity-70" : "",
        ].join(" ")}
      >
        {icon && (
          <span className="text-gray-400 dark:text-gray-500">{icon}</span>
        )}

        <input
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-gray-950 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed dark:text-white"
        />
      </div>
    </label>
  )
}