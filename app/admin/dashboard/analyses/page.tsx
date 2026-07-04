"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Card,
  Upload,
  Image,
  Tag,
  InputNumber,
  Select,
  Spin,
  Typography,
  Switch,
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, LikeOutlined } from "@ant-design/icons"
import dynamic from "next/dynamic"
import type { UploadFile, UploadProps } from "antd/es/upload/interface"
import type { RcFile } from "antd/es/upload"

const { Title } = Typography

// Import Tiptap editor with dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/admin/tiptap-editor"), { ssr: false })

interface User {
  _id: string
  fullName: string
  role: string
}

interface Analysis {
  _id: string
  title: string
  description: string
  image: string
  authorId: string | { _id: string; fullName: string }
  likes: number
  type: "technical" | "fundamental" | "market" | "other"
  isPremium: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [editorContent, setEditorContent] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Fetch analyses and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [analysesRes, usersRes] = await Promise.all([fetch("/api/admin/analyses"), fetch("/api/admin/users")])

        if (!analysesRes.ok || !usersRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const analysesData = await analysesRes.json()
        const usersData = await usersRes.json()

        setAnalyses(analysesData.analyses || [])
        setUsers(usersData.users || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        messageApi.error("Failed to load data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [messageApi])

  const columns = [
    {
      title: "تصویر",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image || "/placeholder.svg"}
          alt="تصویر تحلیل"
          width={80}
          height={50}
          style={{ objectFit: "cover" }}
          fallback="/placeholder.svg?height=50&width=80"
        />
      ),
    },
    {
      title: "عنوان",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "نویسنده",
      key: "author",
      render: (record: Analysis) => {
        const authorName = typeof record.authorId === "object" ? record.authorId.fullName : "نویسنده ناشناس"
        const user = users.find((u) =>
          typeof record.authorId === "string" ? u._id === record.authorId : u._id === record.authorId._id,
        )

        return (
          <span>
            {authorName}
            {user && user.role === "admin" && (
              <Tag color="blue" style={{ marginRight: 8 }}>
                مدیر
              </Tag>
            )}
          </span>
        )
      },
    },
    {
      title: "نوع",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const typeMap = {
          technical: { text: "تکنیکال", color: "blue" },
          fundamental: { text: "بنیادی", color: "green" },
          market: { text: "بازار", color: "orange" },
          other: { text: "سایر", color: "purple" },
        }
        const typeInfo = typeMap[type as keyof typeof typeMap] || { text: type, color: "default" }
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>
      },
    },
    {
      title: "ویژه",
      dataIndex: "isPremium",
      key: "isPremium",
      render: (isPremium: boolean) => (isPremium ? <Tag color="gold">ویژه</Tag> : <Tag color="default">عادی</Tag>),
    },
    {
      title: "لایک‌ها",
      dataIndex: "likes",
      key: "likes",
      render: (likes: number) => (
        <Space>
          <LikeOutlined />
          <span>{likes}</span>
        </Space>
      ),
    },
    {
      title: "تاریخ انتشار",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("fa-IR"),
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: Analysis) => (
        <Space size="middle">
          <Button icon={<EditOutlined /> } onClick={() => handleEdit(record)} />
          <Popconfirm
            title="آیا از حذف این تحلیل اطمینان دارید؟"
            onConfirm={() => handleDelete(record._id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAdd = () => {
    setEditingAnalysis(null)
    form.resetFields()
    setFileList([])
    setEditorContent("")
    setEditorKey((prev) => prev + 1)
    setIsModalVisible(true)
  }

  const handleEdit = (analysis: Analysis) => {
    setEditingAnalysis(analysis)

    // Convert authorId to string if it's an object
    const authorId = typeof analysis.authorId === "object" ? analysis.authorId._id : analysis.authorId

    form.setFieldsValue({
      ...analysis,
      authorId,
      tags: analysis.tags?.join(", ") || "",
    })

    setEditorContent(analysis.description || "")
    setEditorKey((prev) => prev + 1)

    if (analysis.image) {
      setFileList([
        {
          uid: "-1",
          name: "image.png",
          status: "done",
          url: analysis.image,
        },
      ])
    } else {
      setFileList([])
    }

    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/analyses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete analysis")
      }

      setAnalyses(analyses.filter((analysis) => analysis._id !== id))
      messageApi.success("تحلیل با موفقیت حذف شد")
    } catch (error) {
      console.error("Error deleting analysis:", error)
      messageApi.error("خطا در حذف تحلیل")
    }
  }

  const handleEditorChange = (html: string) => {
    setEditorContent(html)
    form.setFieldsValue({ description: html })
  }

  const uploadImage = async (file: RcFile): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
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
      messageApi.error("خطا در آپلود تصویر")
      throw error
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setUploading(true)

      // Process tags
      const tagsArray = values.tags ? values.tags.split(",").map((tag: string) => tag.trim()) : []

      // Handle image upload if there's a new file
      let imageUrl = editingAnalysis?.image || ""
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageUrl = await uploadImage(fileList[0].originFileObj as RcFile)
      }

      const analysisData = {
        ...values,
        isPremium: false,
        description: editorContent,
        image: imageUrl,
        tags: tagsArray,
      }

      if (editingAnalysis) {
        // Update existing analysis
        const response = await fetch(`/api/admin/analyses/${editingAnalysis._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analysisData),
        })

        if (!response.ok) {
          throw new Error("Failed to update analysis")
        }

        const updatedAnalysis = await response.json()

        setAnalyses(
          analyses.map((analysis) => (analysis._id === editingAnalysis._id ? updatedAnalysis.analysis : analysis)),
        )

        messageApi.success("تحلیل با موفقیت ویرایش شد")
      } else {
        // Add new analysis
        const response = await fetch("/api/admin/analyses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(analysisData),
        })

        if (!response.ok) {
          throw new Error("Failed to create analysis")
        }

        const newAnalysis = await response.json()
        setAnalyses([...analyses, newAnalysis.analysis])
        messageApi.success("تحلیل با موفقیت اضافه شد")
      }

      setIsModalVisible(false)
    } catch (error) {
      console.error("Error saving analysis:", error)
      messageApi.error("خطا در ذخیره تحلیل")
    } finally {
      setUploading(false)
    }
  }

  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([])
    },
    beforeUpload: (file) => {
      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "uploading",
          originFileObj: file,
        },
      ])

      // Preview the image
      const reader = new FileReader()
      reader.readAsDataURL(file as Blob)
      reader.onload = () => {
        setFileList((prevList) => [
          {
            ...prevList[0],
            status: "done",
            url: reader.result as string,
          },
        ])
      }

      // Prevent automatic upload
      return false
    },
    fileList,
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spin size="large" tip="در حال بارگذاری..." />
      </div>
    )
  }

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>تحلیل‌ها</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          افزودن تحلیل
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={analyses}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "هیچ تحلیلی یافت نشد" }}
        />
      </Card>

      <Modal
        title={editingAnalysis ? "ویرایش تحلیل" : "افزودن تحلیل جدید"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingAnalysis ? "ویرایش" : "افزودن"}
        cancelText="انصراف"
        width={800}
        confirmLoading={uploading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="عنوان" rules={[{ required: true, message: "لطفا عنوان را وارد کنید!" }]}>
            <Input placeholder="عنوان تحلیل را وارد کنید" />
          </Form.Item>

          <Form.Item
            name="authorId"
            label="نویسنده"
            rules={[{ required: true, message: "لطفا نویسنده را انتخاب کنید!" }]}
          >
            <Select placeholder="نویسنده را انتخاب کنید">
              {users.map((user) => (
                <Select.Option key={user._id} value={user._id}>
                  {user.fullName} {user.role === "admin" && "(مدیر)"}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="نوع تحلیل"
            rules={[{ required: true, message: "لطفا نوع تحلیل را انتخاب کنید!" }]}
            initialValue="technical"
          >
            <Select placeholder="نوع تحلیل را انتخاب کنید">
              <Select.Option value="technical">تکنیکال</Select.Option>
              <Select.Option value="fundamental">بنیادی</Select.Option>
              <Select.Option value="market">بازار</Select.Option>
              <Select.Option value="other">سایر</Select.Option>
            </Select>
          </Form.Item>

          {/* <Form.Item name="isPremium" label="محتوای ویژه" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="ویژه" unCheckedChildren="عادی" />
          </Form.Item> */}

          <Form.Item label="تصویر" name="image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>انتخاب تصویر</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="description" label="محتوا" rules={[{ required: true, message: "لطفا محتوا را وارد کنید!" }]}>
            <TiptapEditor key={editorKey} initialContent={editorContent} onChange={handleEditorChange} rtl={true} />
          </Form.Item>

          <Form.Item name="tags" label="برچسب‌ها">
            <Input placeholder="برچسب‌ها را با کاما جدا کنید" />
          </Form.Item>

          {editingAnalysis && (
            <Form.Item name="likes" label="تعداد لایک‌ها">
              <InputNumber min={0} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}
