import type { ChangeEvent, RefObject } from "react";
import { Mail, Phone, User, Users } from "lucide-react";
import { ProfileInput } from "./ProfileInput";
import { ProfilePhotoBox } from "./ProfilePhotoBox";

type ProfileForm = {
  fullName: string;
  phone: string;
  email: string;
  referralCode: string;
  avatarUrl: string;
};

type ProfileInfoCardProps = {
  form: ProfileForm;
  avatarPreview: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onChange: (field: keyof ProfileForm, value: string) => void;
  onAvatarClick: () => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
};

export function ProfileInfoCard({
  form,
  avatarPreview,
  fileInputRef,
  onChange,
  onAvatarClick,
  onAvatarChange,
  onRemoveAvatar,
}: ProfileInfoCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#090909]">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 md:px-7">
        <h2 className="text-base font-black text-gray-950 dark:text-white">
          اطلاعات حساب
        </h2>
      </div>

      <div className="p-5 md:p-7">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <ProfilePhotoBox
            avatarPreview={avatarPreview}
            fileInputRef={fileInputRef}
            onAvatarClick={onAvatarClick}
            onAvatarChange={onAvatarChange}
            onRemoveAvatar={onRemoveAvatar}
          />

          <div className="space-y-5">
            <ProfileInput
              label="نام کاربری"
              value={form.fullName}
              placeholder="مثلاً: علی احمدی"
              icon={<User className="h-5 w-5" />}
              onChange={(value) => onChange("fullName", value)}
            />

            <ProfileInput
              label="شماره موبایل"
              value={form.phone}
              placeholder="مثلاً: 09123456789"
              icon={<Phone className="h-5 w-5" />}
              disabled
              onChange={() => {}}
            />

            <ProfileInput
              label="ایمیل"
              value={form.email}
              placeholder="مثلاً: user@example.com"
              icon={<Mail className="h-5 w-5" />}
              onChange={(value) => onChange("email", value)}
            />

            <ProfileInput
              label="کد معرف"
              value={form.referralCode}
              placeholder="کد معرف را وارد کنید"
              icon={<Users className="h-5 w-5" />}
              onChange={(value) => onChange("referralCode", value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
