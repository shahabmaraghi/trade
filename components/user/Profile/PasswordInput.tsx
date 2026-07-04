import { Eye, EyeOff, Lock } from "lucide-react"

type PasswordInputProps = {
  label: string
  value: string
  placeholder: string
  showPassword: boolean
  onToggleShow: () => void
  onChange: (value: string) => void
}

export function PasswordInput({
  label,
  value,
  placeholder,
  showPassword,
  onToggleShow,
  onChange,
}: PasswordInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
        {label}
      </label>

      <div className="flex h-12 items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 transition focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-gray-200 dark:border-gray-700 dark:bg-[#0f0f0f] dark:focus-within:border-gray-400 dark:focus-within:ring-gray-800">
        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm font-medium text-gray-950 outline-none placeholder:text-gray-400 dark:text-white"
        />

        <button
          type="button"
          onClick={onToggleShow}
          className="text-gray-400 transition hover:text-gray-700 dark:hover:text-gray-200"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  )
}