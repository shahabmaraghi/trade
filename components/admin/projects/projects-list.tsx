"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, Tabs, Button, Tag, Skeleton, Typography, Space, Divider, Empty, message } from "antd"
import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  LinkOutlined,
  EditOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs

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

export default function ProjectsList() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const url = activeTab === "all" ? "/api/admin/projects" : `/api/admin/projects?status=${activeTab}`

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch projects")
        }
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        message.error("متأسفانه مشکلی در دریافت پروژه‌ها رخ داد. لطفاً صفحه را رفرش کنید.")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [activeTab])

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<AlertOutlined />} color="default">
            در انتظار بررسی
          </Tag>
        )
      case "approved":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            تأیید شده
          </Tag>
        )
      case "rejected":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            رد شده
          </Tag>
        )
      case "caution":
        return (
          <Tag icon={<WarningOutlined />} color="warning">
            هشدار
          </Tag>
        )
      default:
        return <Tag color="default">نامشخص</Tag>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setLoading(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4" style={{ direction: "rtl" }}>
        <Skeleton active paragraph={{ rows: 1 }} />
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6" style={{ direction: "rtl" }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2}>مدیریت پروژه‌ها</Title>
      </div>

      <Tabs defaultActiveKey="all" onChange={handleTabChange} activeKey={activeTab} style={{ marginBottom: 16 }}>
        <TabPane tab="همه" key="all" />
        <TabPane tab="در انتظار بررسی" key="pending" />
        <TabPane tab="تأیید شده" key="approved" />
        <TabPane tab="رد شده" key="rejected" />
        <TabPane tab="هشدار" key="caution" />
      </Tabs>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="در حال حاضر هیچ پروژه‌ای با وضعیت انتخاب شده وجود ندارد."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {projects.map((project) => (
            <Card
              key={project._id}
              hoverable
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{project.platform_name}</span>
                  {getStatusTag(project.status)}
                </div>
              }
              extra={
                <a
                  href={project.platform_website?.startsWith("https://") || project.platform_website?.startsWith("http://") ? project.platform_website : `http://${project.platform_website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <LinkOutlined /> وب‌سایت
                </a>
              }
            >
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div>
                  <Text strong>کاربر:</Text>{" "}
                  <Text type="secondary">
                    {project.user.name} ({project.user.email || project.user.phone})
                  </Text>
                </div>

                <div>
                  <Text strong>توضیحات کاربر:</Text>
                  <Paragraph type="secondary" ellipsis={{ rows: 3, expandable: true, symbol: "بیشتر" }}>
                    {project.user_description}
                  </Paragraph>
                </div>

                {project.admin_description && (
                  <div>
                    <Text strong>نظر کارشناس:</Text>
                    <Paragraph type="secondary" ellipsis={{ rows: 2, expandable: true, symbol: "بیشتر" }}>
                      {project.admin_description}
                    </Paragraph>
                  </div>
                )}

                <Text type="secondary" style={{ fontSize: "12px" }}>
                  تاریخ ثبت: {formatDate(project.created_at)}
                </Text>

                <Divider style={{ margin: "12px 0" }} />

                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => router.push(`/admin/dashboard/projects/${project._id}`)}
                >
                  بررسی و ویرایش
                </Button>
              </Space>
            </Card>
          ))}
        </Space>
      )}
    </div>
  )
}
