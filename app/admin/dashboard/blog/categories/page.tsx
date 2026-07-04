"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Spin } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import Head from "next/head"

// Define the category type
interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  createdAt: string
}

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const router = useRouter()

  // Fetch categories from API
  const fetchCategories = async (page = 1, limit = 10, search = "") => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) {
        queryParams.append("search", search)
      }

      const response = await fetch(`/api/admin/blog/categories?${queryParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data.categories)
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total,
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
      messageApi.error("خطا در دریافت دسته‌بندی‌ها")
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCategories()
  }, [])

  // Table columns
  const columns = [
    {
      title: "عنوان",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "نامک (Slug)",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "تعداد مقالات",
      key: "postCount",
      render: (_: any, record: Category) => {
        // This would ideally come from the API, but for now we'll use a placeholder
        return <span>0</span>
      },
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => {
        // Format date for Persian display
        const formattedDate = new Date(date).toLocaleDateString("fa-IR")
        return <span>{formattedDate}</span>
      },
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="آیا از حذف این دسته‌بندی اطمینان دارید؟"
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
    setEditingCategory(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category")
      }

      // Refresh the list
      fetchCategories(pagination.current, pagination.pageSize, searchText)
      messageApi.success("دسته‌بندی با موفقیت حذف شد")
    } catch (error) {
      console.error("Error deleting category:", error)
      messageApi.error("خطا در حذف دسته‌بندی")
    }
  }

  const handleModalOk = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          if (editingCategory) {
            // Update existing category
            const response = await fetch(`/api/admin/blog/categories/${editingCategory._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to update category")
            }

            messageApi.success("دسته‌بندی با موفقیت ویرایش شد")
          } else {
            // Add new category
            const response = await fetch("/api/admin/blog/categories", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.error || "Failed to create category")
            }

            messageApi.success("دسته‌بندی با موفقیت اضافه شد")
          }

          // Refresh the list
          fetchCategories(pagination.current, pagination.pageSize, searchText)
          setIsModalVisible(false)
        } catch (error: any) {
          console.error("Error saving category:", error)
          messageApi.error(error.message || "خطا در ذخیره دسته‌بندی")
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info)
      })
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    // Only auto-generate slug if we're adding a new category or if the slug field hasn't been manually edited
    if (!editingCategory || editingCategory.name === form.getFieldValue("name")) {
      form.setFieldsValue({ slug: generateSlug(title) })
    }
  }

  const handleTableChange = (pagination: any) => {
    fetchCategories(pagination.current, pagination.pageSize, searchText)
  }

  const handleSearch = () => {
    fetchCategories(1, pagination.pageSize, searchText)
  }

  return (
    <div className="p-6">
      <Head>
        <title>مدیریت دسته‌بندی‌های بلاگ | پنل مدیریت</title>
        <meta name="description" content="مدیریت دسته‌بندی‌های بلاگ در پنل مدیریت" />
      </Head>

      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">دسته‌بندی‌های بلاگ</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          افزودن دسته‌بندی
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex mb-4">
          <Input
            placeholder="جستجو در دسته‌بندی‌ها..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            suffix={<Button type="text" icon={<SearchOutlined />} onClick={handleSearch} />}
          />
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={categories}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>

      <Modal
        title={editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingCategory ? "ویرایش" : "افزودن"}
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="عنوان" rules={[{ required: true, message: "لطفا عنوان را وارد کنید!" }]}>
            <Input placeholder="مثال: اخبار بازار" onChange={handleTitleChange} />
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
            <Input placeholder="مثال: market-news" dir="ltr" />
          </Form.Item>

          <Form.Item name="description" label="توضیحات">
            <Input.TextArea placeholder="توضیحات دسته‌بندی (اختیاری)" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
