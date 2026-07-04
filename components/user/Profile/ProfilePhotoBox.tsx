import type { ChangeEvent, RefObject } from "react"
import { Camera, User } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProfilePhotoBoxProps = {
  avatarPreview: string
  fileInputRef: RefObject<HTMLInputElement | null>
  onAvatarClick: () => void
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveAvatar: () => void
}

export function ProfilePhotoBox({
  avatarPreview,
  fileInputRef,
  onAvatarClick,
  onAvatarChange,
  onRemoveAvatar,
}: ProfilePhotoBoxProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-[#0f0f0f]">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#111827]">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="عکس پروفایل"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-14 w-14 text-gray-400 dark:text-gray-500" />
            )}
          </div>

          <button
            type="button"
            onClick={onAvatarClick}
            className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            <Camera className="h-5 w-5" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onAvatarChange}
            className="hidden"
          />
        </div>

        <h3 className="mt-4 text-sm font-black text-gray-950 dark:text-white">
          عکس کاربر
        </h3>

        <p className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
          فرمت تصویر باید JPG یا PNG باشد و حجم آن بیشتر از ۳ مگابایت نباشد.
        </p>

        <div className="mt-4 flex w-full gap-2">
          <Button
            type="button"
            onClick={onAvatarClick}
            className="h-10 flex-1 bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            انتخاب عکس
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onRemoveAvatar}
            className="h-10 flex-1 border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-200 dark:hover:bg-gray-800"
          >
            حذف
          </Button>
        </div>
      </div>
    </div>
  )
}