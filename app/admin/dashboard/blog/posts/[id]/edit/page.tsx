"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Form, Input, Select, Button, Upload, Card, message, Spin } from "antd"
import { UploadOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import type { UploadFile } from "antd/es/upload/interface"
import dynamic from "next/dynamic"
import Head from "next/head"

import { useParams } from "next/navigation"
// Import Tiptap editor with dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/admin/tiptap-editor"), { ssr: false })

// Define the category type
interface Category {
  _id: string
  name: string
}

// Define the post type
interface Post {
  _id: string
  title: string
  slug: string
  content: string
  categoryId: {
    _id: string
    name: string
  }
  image: string
  status: "published" | "draft"
  author: {
    _id: string
    name: string
  }
  metaTitle?: string
  metaDescription?: string
  viewCount: number
  createdAt: string
  publishedAt?: string
}

export default  function EditBlogPostPage() {
   const params = useParams()
  const id = params.id as string
  const [form] = Form.useForm()
  const [post, setPost] = useState<Post | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [editorContent, setEditorContent] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [messageApi, contextHolder] = message.useMessage()
  const [saving, setSaving] = useState(false)

  const router = useRouter()

  // Status options for blog posts
  const statusOptions = [
    { value: "published", label: "منتشر شده", color: "green" },
    { value: "draft", label: "پیش‌نویس", color: "gold" },
  ]

  // Fetch post data
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch post")
      }

      const data = await response.json()
      setPost(data)

      // Set form values
      form.setFieldsValue({
        title: data.title,
        slug: data.slug,
        categoryId: data.categoryId._id,
        status: data.status,
        content: data.content,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      })

      // Set editor content
      setEditorContent(data.content)
      setEditorKey((prev) => prev + 1)

      // Set image
      if (data.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: data.image,
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      messageApi.error("خطا در دریافت اطلاعات مقاله")
      router.push("/admin/dashboard/blog/posts")
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/blog/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      messageApi.error("خطا در دریافت دسته‌بندی‌ها")
    }
  }

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchPost(), fetchCategories()])
      setLoading(false)
    }

    fetchData()
  }, [id])

  const handleEditorChange = (html: string) => {
    setEditorContent(html)
    form.setFieldsValue({ content: html })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    // Only auto-generate slug if it's the same as the original title
    if (post && post.title === form.getFieldValue("title")) {
      form.setFieldsValue({ slug: generateSlug(title) })
    }
  }

  const uploadProps = {
    onRemove: (file: UploadFile) => {
      setFileList([])
    },
    beforeUpload: async (file: UploadFile) => {
      // Upload to server
      const formData = new FormData()
      formData.append("file", file as any)

      try {
        const response = await fetch("/api/admin/blog/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload image")
        }

        const data = await response.json()

        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: "done",
            url: data.url,
          },
        ])

        // Set the image URL in the form
        form.setFieldsValue({ image: data.url })

        messageApi.success("تصویر با موفقیت آپلود شد")
      } catch (error) {
        console.error("Error uploading image:", error)
        messageApi.error("خطا در آپلود تصویر")
      }

      return false
    },
    fileList,
  }

  const handleSubmit = async (values: any) => {
    // Validate content
    if (!values.content || values.content.trim() === "") {
      messageApi.error("لطفا محتوای مقاله را وارد کنید")
      return
    }

    // Set image from fileList if available
    if (fileList.length > 0 && fileList[0].url) {
      values.image = fileList[0].url
    } else if (post && post.image) {
      values.image = post.image
    } else {
      values.image = "/placeholder.svg"
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update post")
      }

      const data = await response.json()

      messageApi.success("مقاله با موفقیت بروزرسانی شد")

      // Redirect to posts list
      setTimeout(() => {
        router.push("/admin/dashboard/blog/posts")
      }, 1000)
    } catch (error: any) {
      console.error("Error updating post:", error)
      messageApi.error(error.message || "خطا در بروزرسانی مقاله")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <Head>
        <title>ویرایش مقاله | پنل مدیریت</title>
        <meta name="description" content="ویرایش مقاله در پنل مدیریت" />
      </Head>

      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ویرایش مقاله</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/admin/dashboard/blog/posts")}>انصراف</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={saving}>
            ذخیره
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
          <Card title="اطلاعات اصلی" className="mb-6">
            <Form.Item name="title" label="عنوان" rules={[{ required: true, message: "لطفا عنوان را وارد کنید!" }]}>
              <Input placeholder="عنوان مقاله را وارد کنید" onChange={handleTitleChange} />
            </Form.Item>

            <Form.Item
              name="slug"
              label="نامک (Slug)"
              rules={[
                { required: true, message: "لطفا نامک را وارد کنید!" },
                { pattern: /^[a-z0-9-]+$/, message: "نامک فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد" },
              ]}
              help="نامک در URL استفاده می‌شود و باید به انگلیسی باشد"
            >
              <Input placeholder="مثال: market-analysis" dir="ltr" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="categoryId"
                label="دسته‌بندی"
                rules={[{ required: true, message: "لطفا دسته‌بندی را انتخاب کنید!" }]}
              >
                <Select placeholder="دسته‌بندی را انتخاب کنید">
                  {categories.map((category) => (
                    <Select.Option key={category._id} value={category._id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="status"
                label="وضعیت"
                rules={[{ required: true, message: "لطفا وضعیت را انتخاب کنید!" }]}
              >
                <Select placeholder="وضعیت را انتخاب کنید">
                  {statusOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item label="تصویر شاخص" name="image">
              <Upload {...uploadProps} listType="picture" maxCount={1}>
                <Button icon={<UploadOutlined />}>انتخاب تصویر</Button>
              </Upload>
            </Form.Item>
          </Card>

          <Card title="محتوای مقاله" className="mb-6">
            <Form.Item
              name="content"
              rules={[{ required: true, message: "لطفا محتوا را وارد کنید!" }]}
              className="mb-0"
            >
              <TiptapEditor key={editorKey} initialContent={editorContent} onChange={handleEditorChange} rtl={true} />
            </Form.Item>
          </Card>

          <Card title="SEO" className="mb-6">
            <Form.Item
              name="metaTitle"
              label="عنوان متا (Meta Title)"
              help="عنوان صفحه در نتایج جستجو (اگر خالی باشد، از عنوان مقاله استفاده می‌شود)"
            >
              <Input placeholder="عنوان متا را وارد کنید" />
            </Form.Item>

            <Form.Item
              name="metaDescription"
              label="توضیحات متا (Meta Description)"
              help="توضیحات کوتاه برای نمایش در نتایج جستجو"
            >
              <Input.TextArea placeholder="توضیحات متا را وارد کنید" rows={3} />
            </Form.Item>
          </Card>

          <div className="flex justify-end gap-2">
            <Button onClick={() => router.push("/admin/dashboard/blog/posts")}>انصراف</Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
              ذخیره
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                form.setFieldsValue({ status: "published" })
                form.submit()
              }}
              loading={saving}
            >
              ذخیره و انتشار
            </Button>
          </div>
        </Form>
      </Spin>
    </div>
  )
}
