"use client"

import { useState, useEffect } from "react"
import {
  Card,
  Typography,
  Divider,
  Tag,
  Button,
  Form,
  Input,
  Select,
  message,
  Skeleton,
  List,
  Avatar,
  Space,
} from "antd"
import { ArrowLeftOutlined, UserOutlined, SendOutlined } from "@ant-design/icons"
import Link from "next/link"

interface Ticket {
  _id: string
  userId: {
    _id: string
    phone: string
    fullName: string
  }
  subject: string
  message: string
  status: string
  priority: string
  responses: {
    message: string
    isAdmin: boolean
    createdAt: string
    _id: string
  }[]
  createdAt: string
  updatedAt: string
  __v: number
}

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

export default function AdminTicketDetail({ id }: { id: string }) {
  const [ticket, setTicket] = useState<Ticket>()
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTicket()
  }, [id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/admin/support/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch ticket")
      }

      const data = await response.json()
      setTicket(data)
    } catch (error) {
      console.error("Error fetching ticket:", error)
      message.error("خطا در دریافت جزئیات تیکت")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "green"
      case "in_progress":
        return "gold"
      case "closed":
        return "red"
      default:
        return "blue"
    }
  }

  const getStatusText = (status: (string & {}) | "open" | "in_progress" | "closed") => {
    switch (status) {
      case "open":
        return "باز"
      case "in_progress":
        return "در حال بررسی"
      case "closed":
        return "بسته شده"
      default:
        return status
    }
  }

  const handleSubmit = async (values: { response: string; status: "open" | "in_progress" | "closed" }) => {
    setSubmitting(true)
    console.log("values", values)
    try {
      const response = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminResponse: values.response,
          status: values.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update ticket")
      }

      message.success("پاسخ با موفقیت ارسال شد")
      form.resetFields()
      fetchTicket() // Refresh ticket data
    } catch (error) {
      console.error("Error updating ticket:", error)
      message.error("خطا در ارسال پاسخ")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton active />
        <Divider />
        <Skeleton active />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="p-6">
        <Title level={4}>تیکت یافت نشد</Title>
        <Button type="primary">
          <Link href="/admin/dashboard/support">
            <ArrowLeftOutlined /> بازگشت به لیست تیکت‌ها
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Space>
          <Button type="primary">
            <Link href="/admin/dashboard/support">
              <ArrowLeftOutlined /> بازگشت به لیست تیکت‌ها
            </Link>
          </Button>
          <Tag color={getStatusColor(ticket.status)}>{getStatusText(ticket.status)}</Tag>
        </Space>
      </div>

      <Card className="mb-6">
        <Title level={3}>{ticket.subject}</Title>
        <div className="mb-4">
          <Text type="secondary">
            ایجاد شده توسط: {ticket.userId?.fullName || "ناشناس"} | تاریخ:{" "}
            {new Date(ticket.createdAt).toLocaleDateString("fa-IR")}
          </Text>
        </div>
        <Paragraph>{ticket.message}</Paragraph>
      </Card>

      {ticket.responses && ticket.responses.length > 0 && (
        <Card className="mb-6">
          <Title level={4}>پاسخ‌ها</Title>
          <List
            itemLayout="horizontal"
            dataSource={ticket.responses}
            renderItem={(response) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={response.isAdmin ? <UserOutlined /> : null} />}
                  title={
                    <div>
                      <Text strong>{response.isAdmin ? "پاسخ ادمین" : "پاسخ کاربر"}</Text>
                      <Text type="secondary" className="mr-4">
                        {new Date(response.createdAt).toLocaleDateString("fa-IR")}
                      </Text>
                    </div>
                  }
                  description={response.message}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {ticket.status !== "closed" && (
        <Card title="پاسخ به تیکت">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="response"
              label="پاسخ شما"
              rules={[{ required: true, message: "لطفا پاسخ خود را وارد کنید" }]}
            >
              <TextArea rows={4} placeholder="پاسخ خود را وارد کنید" />
            </Form.Item>

            <Form.Item name="status" label="تغییر وضعیت" initialValue={ticket.status}>
              <Select>
                <Option value="open">باز</Option>
                <Option value="in_progress">در حال بررسی</Option>
                <Option value="closed">بسته شده</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SendOutlined />}>
                ارسال پاسخ
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  )
}
