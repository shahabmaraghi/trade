"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/AuthProvider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload } from "lucide-react"
import TiptapEditor from "@/components/admin/tiptap-editor"
import { toast } from "sonner"
import Image from "next/image"

export default function CreateAnalysis() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("technical")
  const [isPremium, setIsPremium] = useState(false)
  const [tags, setTags] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isLoading, isAuthenticated, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async () => {
    if (!image) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", image)

      const response = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("خطا در آپلود تصویر")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description) {
      toast.error("لطفاً عنوان و محتوای تحلیل را وارد کنید")
      return
    }

    setIsSubmitting(true)
    try {
      // Upload image if selected
      const imageUrl = image ? await uploadImage() : null

      // Create analysis
      const response = await fetch("/api/user/analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          image: imageUrl,
          type,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag),
          isPremium,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create analysis")
      }

      toast.success("تحلیل با موفقیت ایجاد شد")
      router.push("/user/analyses")
    } catch (error) {
      console.error("Error creating analysis:", error)
      toast.error("خطا در ایجاد تحلیل")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>ایجاد تحلیل جدید</CardTitle>
          <CardDescription>تحلیل جدیدی ایجاد کنید و آن را با سایر کاربران به اشتراک بگذارید.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان تحلیل را وارد کنید"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">نوع تحلیل</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع تحلیل را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">تکنیکال</SelectItem>
                  <SelectItem value="fundamental">بنیادی</SelectItem>
                  <SelectItem value="market">بازار</SelectItem>
                  <SelectItem value="other">سایر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">تصویر شاخص</Label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="w-full h-32 border-dashed flex flex-col items-center justify-center"
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span>انتخاب تصویر</span>
                </Button>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                {imagePreview && (
                  <div className="relative h-32 w-32 overflow-hidden rounded-md">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">محتوای تحلیل</Label>
              <TiptapEditor
                initialContent={description}
                onChange={setDescription}
                rtl={true}
                placeholder="محتوای تحلیل را وارد کنید..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">برچسب‌ها</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="برچسب‌ها را با کاما جدا کنید"
              />
              <p className="text-xs text-muted-foreground">برچسب‌ها را با کاما (،) از هم جدا کنید</p>
            </div>

            {/* <div className="flex items-center space-x-2 space-x-reverse">
              <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
              <Label htmlFor="premium">تحلیل ویژه (فقط برای کاربران اشتراک ویژه)</Label>
            </div> */}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/user/analyses")}>
              انصراف
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ذخیره تحلیل
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
