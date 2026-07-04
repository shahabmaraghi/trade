import { ShieldCheck } from "lucide-react"
import { PasswordInput } from "./PasswordInput"

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordCardProps = {
  passwordForm: PasswordForm
  showCurrentPassword: boolean
  showNewPassword: boolean
  showConfirmPassword: boolean
  onPasswordChange: (field: keyof PasswordForm, value: string) => void
  onToggleCurrentPassword: () => void
  onToggleNewPassword: () => void
  onToggleConfirmPassword: () => void
}

export function PasswordCard({
  passwordForm,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  onPasswordChange,
  onToggleCurrentPassword,
  onToggleNewPassword,
  onToggleConfirmPassword,
}: PasswordCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#090909]">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 md:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-[#111827] dark:text-gray-300">
            <ShieldCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-black text-gray-950 dark:text-white">
              تغییر رمز عبور
            </h2>

          
          </div>
        </div>
      </div>

      <div className="p-5 md:p-7">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <PasswordInput
            label="رمز عبور فعلی"
            value={passwordForm.currentPassword}
            placeholder="رمز فعلی"
            showPassword={showCurrentPassword}
            onToggleShow={onToggleCurrentPassword}
            onChange={(value) => onPasswordChange("currentPassword", value)}
          />

          <PasswordInput
            label="رمز عبور جدید"
            value={passwordForm.newPassword}
            placeholder="حداقل ۸ کاراکتر"
            showPassword={showNewPassword}
            onToggleShow={onToggleNewPassword}
            onChange={(value) => onPasswordChange("newPassword", value)}
          />

          <PasswordInput
            label="تکرار رمز عبور جدید"
            value={passwordForm.confirmPassword}
            placeholder="تکرار رمز جدید"
            showPassword={showConfirmPassword}
            onToggleShow={onToggleConfirmPassword}
            onChange={(value) => onPasswordChange("confirmPassword", value)}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#0f0f0f]">
          <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
            رمز عبور جدید باید حداقل ۸ کاراکتر باشد.
          </p>
        </div>
      </div>
    </section>
  )
}