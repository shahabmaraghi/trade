"use client"

import { ProfileInfoCard } from "./ProfileInfoCard"
import { PasswordCard } from "./PasswordCard"
import { AlertMessage } from "./AlertMessage"
import { FormActions } from "./FormActions"
import { LoadingState } from "./LoadingState"
import { useProfileSettings } from "./useProfileSettings"

export default function UserProfileSettings() {
  const {
    form,
    passwordForm,
    avatarPreview,
    fileInputRef,
    loading,
    profileSaving,
    passwordSaving,
    message,

    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,

    handleChange,
    handlePasswordChange,
    handleAvatarClick,
    handleAvatarChange,
    handleRemoveAvatar,
    handleSubmit,

    toggleCurrentPassword,
    toggleNewPassword,
    toggleConfirmPassword,
  } = useProfileSettings()

  const saving = profileSaving || passwordSaving

  return (
    <main
      dir="rtl"
      className="min-h-[calc(100vh-64px)] bg-gray-100 p-4 text-gray-950 dark:bg-[#111827] dark:text-white md:p-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-white">
            تنظیمات پروفایل
          </h1>

          <p className="text-sm leading-7 text-gray-500 dark:text-gray-400">
            اطلاعات حساب کاربری، رمز عبور و کد معرف خود را از این بخش مدیریت کنید.
          </p>
        </div>

        {loading ? (
          <LoadingState />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
              <AlertMessage type={message.type} text={message.text} />
            )}

            <ProfileInfoCard
              form={form}
              avatarPreview={avatarPreview}
              fileInputRef={fileInputRef}
              onChange={handleChange}
              onAvatarClick={handleAvatarClick}
              onAvatarChange={handleAvatarChange}
              onRemoveAvatar={handleRemoveAvatar}
            />

            <PasswordCard
              passwordForm={passwordForm}
              showCurrentPassword={showCurrentPassword}
              showNewPassword={showNewPassword}
              showConfirmPassword={showConfirmPassword}
              onPasswordChange={handlePasswordChange}
              onToggleCurrentPassword={toggleCurrentPassword}
              onToggleNewPassword={toggleNewPassword}
              onToggleConfirmPassword={toggleConfirmPassword}
            />
      <FormActions saving={saving} />
          </form>
        )}
      </div>
    </main>
  )
}