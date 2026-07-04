"use client"

import { useState, useEffect } from "react"
import { Table, Button, Space, Tag, Card, Spin, Image, Select, Input, Popconfirm, message } from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Head from "next/head"

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
  viewCount: number
  createdAt: string
  publishedAt?: string
}

// Define the category type
interface Category {
  _id: string
  name: string
}

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [messageApi, contextHolder] = message.useMessage()

  const router = useRouter()

  // Status options for blog posts
  const statusOptions = [
    { value: "published", label: "منتشر شده", color: "green" },
    { value: "draft", label: "پیش‌نویس", color: "gold" },
  ]

  // Fetch posts from API
  const fetchPosts = async (page = 1, limit = 10, search = "", category = "", status = "") => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) {
        queryParams.append("search", search)
      }

      if (category) {
        queryParams.append("category", category)
      }

      if (status) {
        queryParams.append("status", status)
      }

      const response = await fetch(`/api/admin/blog/posts?${queryParams}`)

      if (!response.ok) {
        throw new Error("Failed to fetch posts")
      }

      const data = await response.json()
      setPosts(data.posts)
      setPagination({
        current: data.pagination.page,
        pageSize: data.pagination.limit,
        total: data.pagination.total,
      })
    } catch (error) {
      console.error("Error fetching posts:", error)
      messageApi.error("خطا در دریافت مقالات")
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories for filter
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
    fetchPosts()
    fetchCategories()
  }, [])

  // Table columns
  const columns = [
    {
      title: "تصویر",
      dataIndex: "image",
      key: "image",
      render: (image: string) => (
        <Image
          src={image || "/placeholder.svg"}
          alt="تصویر مقاله"
          width={80}
          height={50}
          style={{ objectFit: "cover" }}
          fallback="/placeholder.svg"
        />
      ),
    },
    {
      title: "عنوان",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Post) => (
        <Link href={`/admin/dashboard/blog/posts/${record._id}/edit`} className="text-blue-600 hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: "دسته‌بندی",
      dataIndex: ["categoryId", "name"],
      key: "categoryId",
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusOption = statusOptions.find((s) => s.value === status)
        return statusOption ? <Tag color={statusOption.color}>{statusOption.label}</Tag> : "نامشخص"
      },
    },
    {
      title: "بازدید",
      dataIndex: "viewCount",
      key: "viewCount",
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
      render: (_: any, record: Post) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/dashboard/blog/posts/${record._id}/edit`)}
          />
          <Button icon={<EyeOutlined />} onClick={() => window.open(`/blog/${record.slug}`, "_blank")} />
          <Popconfirm
            title="آیا از حذف این مقاله اطمینان دارید؟"
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      // Refresh the list
      fetchPosts(pagination.current, pagination.pageSize, searchText, categoryFilter, statusFilter)
      messageApi.success("مقاله با موفقیت حذف شد")
    } catch (error) {
      console.error("Error deleting post:", error)
      messageApi.error("خطا در حذف مقاله")
    }
  }

  const handleTableChange = (pagination: any) => {
    fetchPosts(pagination.current, pagination.pageSize, searchText, categoryFilter, statusFilter)
  }

  const handleSearch = () => {
    fetchPosts(1, pagination.pageSize, searchText, categoryFilter, statusFilter)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    fetchPosts(1, pagination.pageSize, searchText, value, statusFilter)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    fetchPosts(1, pagination.pageSize, searchText, categoryFilter, value)
  }

  return (
    <div className="p-6">
      <Head>
        <title>مدیریت مقالات بلاگ | پنل مدیریت</title>
        <meta name="description" content="مدیریت مقالات بلاگ در پنل مدیریت" />
      </Head>

      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">مقالات بلاگ</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push("/admin/dashboard/blog/posts/new")}>
          افزودن مقاله
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="جستجو در مقالات..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
              suffix={<Button type="text" icon={<SearchOutlined />} onClick={handleSearch} />}
            />
          </div>

          <div className="w-[200px]">
            <Select
              placeholder="فیلتر دسته‌بندی"
              style={{ width: "100%" }}
              allowClear
              onChange={handleCategoryChange}
              value={categoryFilter || undefined}
            >
              {categories.map((category) => (
                <Select.Option key={category._id} value={category._id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="w-[200px]">
            <Select
              placeholder="فیلتر وضعیت"
              style={{ width: "100%" }}
              allowClear
              onChange={handleStatusChange}
              value={statusFilter || undefined}
            >
              {statusOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={posts}
            rowKey="_id"
            pagination={pagination}
            onChange={handleTableChange}
          />
        </Spin>
      </Card>
    </div>
  )
}
