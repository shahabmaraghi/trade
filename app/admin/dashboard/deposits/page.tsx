"use client"

import { useEffect, useMemo, useState } from "react"
import { Table, Tag, Space, Button, Popconfirm, message, Select } from "antd"

type DepositStatus = "pending" | "approved" | "rejected"

type Requester =
  | { type: "user"; name: string; phone: string }
  | { type: "mentor"; name: string; username: string }

interface DepositRow {
  id: string
  requesterType: "user" | "mentor"
  requesterId: string
  amount: number
  status: DepositStatus
  createdAt: string
  updatedAt: string
  requester: Requester
}

export default function AdminDepositsPage() {
  const [data, setData] = useState<DepositRow[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<DepositStatus | "all">("pending")
  const [typeFilter, setTypeFilter] = useState<"all" | "user" | "mentor">("all")

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (typeFilter !== "all") params.set("requesterType", typeFilter)
      const res = await fetch(`/api/admin/deposits?${params.toString()}`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setData(json.items || [])
    } catch {
      message.error("خطا در دریافت لیست درخواست‌ها")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter])

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/admin/deposits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "خطا")
      message.success(action === "approve" ? "درخواست تایید شد" : "درخواست رد شد")
      fetchData()
    } catch {
      message.error("انجام عملیات ناموفق بود")
    }
  }

  const columns = useMemo(
    () => [
      {
        title: "نوع درخواست کننده",
        dataIndex: "requesterType",
        key: "requesterType",
        render: (val: DepositRow["requesterType"]) => (val === "user" ? "کاربر" : "منتور"),
      },
      {
        title: "نام",
        key: "name",
        render: (_: any, row: DepositRow) => row.requester?.name || "-",
      },
      {
        title: "شناسه/تماس",
        key: "identity",
        render: (_: any, row: DepositRow) =>
          row.requesterType === "user" ? row.requester && (row.requester as any).phone : row.requester && (row.requester as any).username,
      },
      {
        title: "مبلغ",
        dataIndex: "amount",
        key: "amount",
        render: (val: number) => `${(val || 0).toLocaleString()} تومان`,
      },
      {
        title: "وضعیت",
        dataIndex: "status",
        key: "status",
        render: (val: DepositStatus) => {
          const color = val === "approved" ? "green" : val === "rejected" ? "red" : "gold"
          const label = val === "approved" ? "تایید شده" : val === "rejected" ? "رد شده" : "در انتظار"
          return <Tag color={color}>{label}</Tag>
        },
      },
      {
        title: "تاریخ درخواست",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (val: string) => new Date(val).toLocaleString("fa-IR"),
      },
      {
        title: "اقدامات",
        key: "actions",
        render: (_: any, row: DepositRow) => (
          <Space>
            <Popconfirm
              title="تایید پرداخت این درخواست؟"
              okText="بله"
              cancelText="خیر"
              onConfirm={() => handleAction(row.id, "approve")}
              disabled={row.status !== "pending"}
            >
              <Button type="primary" disabled={row.status !== "pending"}>
                تایید
              </Button>
            </Popconfirm>
            <Popconfirm
              title="رد این درخواست؟"
              okText="بله"
              cancelText="خیر"
              onConfirm={() => handleAction(row.id, "reject")}
              disabled={row.status !== "pending"}
            >
              <Button danger disabled={row.status !== "pending"}>
                رد
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <div className="p-4">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as any)}
          options={[
            { value: "all", label: "همه وضعیت‌ها" },
            { value: "pending", label: "در انتظار" },
            { value: "approved", label: "تایید شده" },
            { value: "rejected", label: "رد شده" },
          ]}
          style={{ width: 160 }}
        />
        <Select
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as any)}
          options={[
            { value: "all", label: "همه" },
            { value: "user", label: "کاربران" },
            { value: "mentor", label: "منتورها" },
          ]}
          style={{ width: 140 }}
        />
        <Button onClick={fetchData}>بازخوانی</Button>
      </div>
      <Table
        rowKey={(r) => r.id}
        loading={loading}
        columns={columns as any}
        dataSource={data}
        pagination={{ pageSize: 20 }}
      />
    </div>
  )
}
