"use client"

import { useState, useEffect } from "react"
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm, Card } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import dynamic from "next/dynamic"

// Import Tiptap editor with dynamic import to avoid SSR issues
const TiptapEditor = dynamic(() => import("@/components/admin/tiptap-editor"), { ssr: false })

// Define the subscription plan type
interface SubscriptionPlan {
  _id: string
  name: string
  price: number
  durationDays: number
  durationHours?: number
  features: string[]
  isDefault: boolean
  isFree: boolean
  description?: string // For backward compatibility with UI
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [editorContent, setEditorContent] = useState("")
  const [editorKey, setEditorKey] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch subscription plans on component mount
  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/subscriptions/plans", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials
      })

      if (response.status === 401) {
        messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans")
      }

      const data = await response.json()

      // Map the data to match our UI expectations
      const formattedPlans = data.map((plan: SubscriptionPlan) => ({
        ...plan,
        id: plan._id, // For backward compatibility with UI
        title: plan.name, // For backward compatibility with UI
        description: plan.features?.join("\n") || "", // For backward compatibility with UI
      }))

      setPlans(formattedPlans)
    } catch (error) {
      console.error("Error fetching plans:", error)
      messageApi.error("خطا در دریافت اطلاعات اشتراک‌ها")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: "عنوان",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "قیمت (تومان)",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString("fa-IR"),
    },
    {
      title: "مدت (روز)",
      dataIndex: "durationDays",
      key: "durationDays",
    },
    {
      title: "رایگان",
      dataIndex: "isFree",
      key: "isFree",
      render: (isFree: boolean) => (isFree ? "بله" : "خیر"),
    },
    {
      title: "ویژگی‌ها",
      dataIndex: "features",
      key: "features",
      render: (features: string[]) => (
        <div className="max-w-md max-h-20 overflow-hidden">
          {features.map((feature, index) => (
            <div key={index}>{feature}</div>
          ))}
          {features.length > 3 && <span>...</span>}
        </div>
      ),
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: SubscriptionPlan) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="آیا از حذف این اشتراک اطمینان دارید؟"
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
    setEditingPlan(null)
    form.resetFields()
    setEditorContent("")
    setEditorKey((prev) => prev + 1)
    setIsModalVisible(true)
  }

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)

    // Format features as HTML for the editor
    const featuresHtml = plan.features?.length
      ? `<ul>${plan.features.map((feature) => `<li>${feature}</li>`).join("")}</ul>`
      : ""

    form.setFieldsValue({
      name: plan.name,
      price: plan.price,
      durationDays: plan.durationDays,
      durationHours: plan.durationHours || 0,
      isFree: plan.isFree,
      features: featuresHtml,
    })

    setEditorContent(featuresHtml)
    setEditorKey((prev) => prev + 1)
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.status === 401) {
        messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید")
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete subscription plan")
      }

      messageApi.success("اشتراک با موفقیت حذف شد")
      fetchPlans() // Refresh the list
    } catch (error: any) {
      console.error("Error deleting plan:", error)
      messageApi.error(error.message || "خطا در حذف اشتراک")
    }
  }

  const handleEditorChange = (html: string) => {
    setEditorContent(html)
    form.setFieldsValue({ features: html })
  }

  // Extract features from HTML content
  const extractFeaturesFromHtml = (html: string): string[] => {
    // Simple extraction of list items
    const features: string[] = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // Extract from list items
    const listItems = doc.querySelectorAll("li")
    listItems.forEach((item) => {
      if (item.textContent?.trim()) {
        features.push(item.textContent.trim())
      }
    })

    // If no list items, try to extract from paragraphs
    if (features.length === 0) {
      const paragraphs = doc.querySelectorAll("p")
      paragraphs.forEach((p) => {
        if (p.textContent?.trim()) {
          features.push(p.textContent.trim())
        }
      })
    }

    return features
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()

      // Extract features from HTML content
      const features = extractFeaturesFromHtml(editorContent)

      const planData = {
        name: values.name,
        price: values.price,
        durationDays: values.durationDays,
        durationHours: values.durationHours || 0,
        isFree: values.isFree || false,
        features,
      }

      // If this plan is set as free, check if it's allowed
      if (values.isFree && !editingPlan?.isFree) {
        // Check if there's already a free plan
        const response = await fetch("/api/admin/subscriptions/plans/check-free")
        const { hasFree } = await response.json()

        if (hasFree) {
          messageApi.error("یک اشتراک رایگان قبلاً تعریف شده است. لطفا ابتدا آن را غیرفعال کنید.")
          return
        }
      }

      if (editingPlan) {
        // Update existing plan
        const response = await fetch(`/api/admin/subscriptions/plans/${editingPlan._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(planData),
        })

        if (response.status === 401) {
          messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید")
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update subscription plan")
        }

        messageApi.success("اشتراک با موفقیت ویرایش شد")
      } else {
        // Add new plan
        const response = await fetch("/api/admin/subscriptions/plans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(planData),
        })

        if (response.status === 401) {
          messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید")
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create subscription plan")
        }

        messageApi.success("اشتراک با موفقیت اضافه شد")
      }

      setIsModalVisible(false)
      fetchPlans() // Refresh the list
    } catch (error: any) {
      console.error("Error saving plan:", error)
      messageApi.error(error.message || "خطا در ذخیره اشتراک")
    }
  }

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مدیریت اشتراک‌ها</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          افزودن اشتراک
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={plans} rowKey="_id" pagination={{ pageSize: 10 }} loading={loading} />
      </Card>

      <Modal
        title={editingPlan ? "ویرایش اشتراک" : "افزودن اشتراک جدید"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingPlan ? "ویرایش" : "افزودن"}
        cancelText="انصراف"
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="عنوان" rules={[{ required: true, message: "لطفا عنوان را وارد کنید!" }]}>
            <Input placeholder="مثال: اشتراک طلایی" />
          </Form.Item>

          <Form.Item name="price" label="قیمت (تومان)" rules={[{ required: true, message: "لطفا قیمت را وارد کنید!" }]}>
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
              placeholder="مثال: 1000000"
            />
          </Form.Item>

          <Form.Item
            name="durationDays"
            label="مدت اشتراک (روز)"
            rules={[{ required: true, message: "لطفا مدت اشتراک را وارد کنید!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} placeholder="مثال: 30" />
          </Form.Item>

          <Form.Item
            name="durationHours"
            label="مدت اشتراک (ساعت)"
            rules={[{ required: true, message: "لطفا مدت اشتراک را وارد کنید!" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={23} placeholder="مثال: 12" />
          </Form.Item>

          <Form.Item name="isFree" label="اشتراک رایگان" valuePropName="checked">
            <Input type="checkbox" />
          </Form.Item>

          <Form.Item
            name="features"
            label="ویژگی‌ها و توضیحات"
            rules={[{ required: true, message: "لطفا ویژگی‌ها را وارد کنید!" }]}
          >
            <TiptapEditor key={editorKey} initialContent={editorContent} onChange={handleEditorChange} rtl={true} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
