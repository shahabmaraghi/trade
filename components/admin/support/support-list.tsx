"use client"

import { useState, useEffect } from "react"
import { Table, Tag, Button, message, Input, Typography } from "antd"
import Link from "next/link"
import { SearchOutlined } from "@ant-design/icons"
import type { TableColumnType } from "antd/lib"

interface TicketsResponse {
  tickets: {
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
  }[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

const { Title } = Typography

export default function AdminSupportList() {
  const [tickets, setTickets] = useState<TicketsResponse>()
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/admin/support")
        if (!response.ok) {
          throw new Error("Failed to fetch tickets")
        }

        const data = (await response.json()) as TicketsResponse
        setTickets(data)
      } catch (error) {
        console.error("Error fetching tickets:", error)
        message.error("خطا در دریافت تیکت‌ها")
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

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

  const getStatusText = (status: string) => {
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

  const filteredTickets =
    tickets?.tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.userId?.phone.toLowerCase().includes(searchText.toLowerCase()),
    ) ?? []

  const columns: TableColumnType<TicketsResponse["tickets"][number]>[] = [
    {
      title: "شناسه",
      dataIndex: "_id",
      key: "_id",
      render: (text) => text.substring(0, 8) + "...",
    },
    {
      title: "موضوع",
      dataIndex: "subject",
      key: "subject",
      render: (text) => (
        <div style={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</div>
      ),
    },
    {
      title: "کاربر",
      dataIndex: "userId",
      key: "userId",
      render: (userId) => userId.fullName || "ناشناس",
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("fa-IR"),
    },
    {
      title: "عملیات",
      key: "action",
      render: (_, record) => (
        <Button type="primary" size="small">
          <Link href={`/admin/dashboard/support/${record._id}`}>مشاهده</Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>مدیریت تیکت‌های پشتیبانی</Title>
        <Input
          placeholder="جستجو..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined />}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredTickets}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
