"use client"

import { useEffect, useRef, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"

type ProfileForm = {
  fullName: string
  phone: string
  email: string
  referralCode: string
  avatarUrl: string
}

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type MessageState = {
  type: "success" | "error"
  text: string
}

const emptyProfile: ProfileForm = {
  fullName: "",
  phone: "",
  email: "",
  referralCode: "",
  avatarUrl: "",
}

const emptyPassword: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
}

export function useProfileSettings() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [form, setForm] = useState<ProfileForm>(emptyProfile)
  const [originalForm, setOriginalForm] = useState<ProfileForm>(emptyProfile)

  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPassword)

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("")

  const [loading, setLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [message, setMessage] = useState<MessageState | null>(null)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)

        const res = await fetch("/api/user/profile", {
          method: "GET",
          credentials: "include",
        })

        if (!res.ok) return

        const data = await res.json()

        const profileData: ProfileForm = {
          fullName: data.fullName || "",
          phone: data.phone || "",
          email: data.email || "",
          referralCode: data.referralCode || "",
          avatarUrl: data.avatarUrl || "",
        }

        setForm(profileData)
        setOriginalForm(profileData)
        setAvatarPreview(data.avatarUrl || "")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
    setMessage(null)
  }

  const isChangingPassword = Boolean(
    passwordForm.currentPassword ||
    passwordForm.newPassword ||
    passwordForm.confirmPassword
  )

  const validateForm = () => {
    if (!form.fullName.trim()) {
      setMessage({ type: "error", text: "نام کاربری را وارد کنید." })
      return false
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setMessage({ type: "error", text: "فرمت ایمیل صحیح نیست." })
      return false
    }

    if (isChangingPassword) {
      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setMessage({ type: "error", text: "همه فیلدهای رمز را پر کنید." })
        return false
      }

      if (passwordForm.newPassword.length < 8) {
        setMessage({ type: "error", text: "رمز حداقل ۸ کاراکتر باشد." })
        return false
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage({ type: "error", text: "رمزها یکسان نیستند." })
        return false
      }
    }

    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateForm()) return

    setProfileSaving(true)
    setPasswordSaving(true)
    setMessage(null)

    try {
      // 1) password update
      if (isChangingPassword) {
        const resPass = await fetch("/api/user/profile/password", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(passwordForm),
        })

        const dataPass = await resPass.json()

        if (!resPass.ok) {
          setMessage({ type: "error", text: dataPass.message })
          return
        }

        setPasswordForm(emptyPassword)
      }

      // 2) profile update
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          avatarUrl: avatarPreview,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: "error", text: data.message })
        return
      }

      setForm(data.data)
      setOriginalForm(data.data)

      setMessage({
        type: "success",
        text: "پروفایل با موفقیت ذخیره شد",
      })
    } finally {
      setProfileSaving(false)
      setPasswordSaving(false)
    }
  }
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "فقط فایل تصویر قابل قبول است.",
      })
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "حجم تصویر نباید بیشتر از ۳ مگابایت باشد.",
      })
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setMessage(null)
  }
  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
    setForm((prev) => ({
      ...prev,
      avatarUrl: "",
    }))

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setMessage(null)
  }
  return {
    form,
    passwordForm,
    avatarPreview,
    fileInputRef,
    loading,
    profileSaving,
    passwordSaving,
    message,

    handleChange,
    handlePasswordChange,

    handleAvatarClick,
    handleAvatarChange,
    handleRemoveAvatar,

    handleSubmit,

    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,

    toggleCurrentPassword: () => setShowCurrentPassword((v) => !v),
    toggleNewPassword: () => setShowNewPassword((v) => !v),
    toggleConfirmPassword: () => setShowConfirmPassword((v) => !v),
  }
}