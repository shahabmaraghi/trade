"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, Typography, Descriptions, Button, Space, Divider, Form, Input, Select, Skeleton, message } from "antd"
import { ArrowLeftOutlined, SaveOutlined, LinkOutlined } from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface User {
  _id: string
  name: string
  email: string
  phone: string
}

interface Project {
  _id: string
  user: User
  platform_name: string
  platform_website: string
  user_description: string
  admin_description: string
  status: "pending" | "approved" | "rejected" | "caution"
  created_at: string
  updated_at: string
}

export default function ProjectDetail({ id }: { id: string }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        const data = await response.json()
        setProject(data)
        form.setFieldsValue({
          status: data.status,
          admin_description: data.admin_description || "",
        })
      } catch (error) {
        message.error("متأسفانه مشکلی در دریافت اطلاعات پروژه رخ داد.")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id, form])

  const handleSubmit = async (values: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        message.error("خطا در بروزرسانی پروژه")
        throw new Error("Failed to update project")
      }

      const updatedProject = await response.json()
      setProject(updatedProject)
      message.success("پروژه با موفقیت به‌روزرسانی شد.")
      router.push("/admin/dashboard/projects")
    } catch (error) {
      message.error("متأسفانه مشکلی در به‌روزرسانی پروژه رخ داد.")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6" style={{ direction: "rtl" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6" style={{ direction: "rtl" }}>
        <Card>
          <Title level={4}>پروژه یافت نشد</Title>
          <Paragraph>متأسفانه پروژه مورد نظر یافت نشد.</Paragraph>
          <Button type="primary" onClick={() => router.push("/admin/dashboard/projects")}>
            بازگشت به لیست پروژه‌ها
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6" style={{ direction: "rtl" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Title level={3}>بررسی پروژه</Title>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/admin/dashboard/projects")}>
              بازگشت به لیست
            </Button>
          </div>

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="نام پلتفرم">{project.platform_name}</Descriptions.Item>
            <Descriptions.Item label="وب‌سایت">
              <a href={project.platform_website} target="_blank" rel="noopener noreferrer">
                <Space>
                  <LinkOutlined />
                  {project.platform_website}
                </Space>
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="کاربر">
              {project.user.name} ({project.user.email || project.user.phone})
            </Descriptions.Item>
            <Descriptions.Item label="توضیحات کاربر">
              <Paragraph>{project.user_description}</Paragraph>
            </Descriptions.Item>
            <Descriptions.Item label="تاریخ ثبت">{formatDate(project.created_at)}</Descriptions.Item>
            <Descriptions.Item label="آخرین به‌روزرسانی">{formatDate(project.updated_at)}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="right">بررسی و نظر کارشناس</Divider>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: project.status,
              admin_description: project.admin_description || "",
            }}
          >
            <Form.Item
              name="status"
              label="وضعیت پروژه"
              rules={[{ required: true, message: "لطفاً وضعیت پروژه را انتخاب کنید" }]}
            >
              <Select placeholder="انتخاب وضعیت">
                <Option value="pending">در انتظار بررسی</Option>
                <Option value="approved">تأیید شده</Option>
                <Option value="rejected">رد شده</Option>
                <Option value="caution">هشدار</Option>
              </Select>
            </Form.Item>

            <Form.Item name="admin_description" label="توضیحات کارشناس">
              <TextArea rows={6} placeholder="توضیحات و نظرات خود را وارد کنید..." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                ذخیره تغییرات
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}
