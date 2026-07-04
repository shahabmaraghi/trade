"use client"

import type React from "react"

import { useState } from "react"
import { Layout, Menu, Button, theme, Dropdown, Avatar, Space, Breadcrumb } from "antd"
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CrownOutlined,
  ReadOutlined,
  LineChartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  BarsOutlined,
  CustomerServiceOutlined,
  SearchOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BarChart2,
  FileText,
  FolderTree,
  CreditCard,
  Lock,
  HelpCircle,
  Search,
  Sparkles,
} from "lucide-react"

const { Header, Sider, Content } = Layout

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  // Function to get the current page title based on the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean)

    if (path.length === 1 && path[0] === "dashboard") {
      return "داشبورد"
    }

    if (path.length >= 2) {
      switch (path[1]) {
        case "users":
          return "مدیریت کاربران"
        case "subscription-plans":
          return "مدیریت اشتراک‌ها"
        case "blog":
          if (path.length === 3 && path[2] === "categories") {
            return "دسته‌بندی‌های بلاگ"
          }
          if (path.length === 3 && path[2] === "posts") {
            return "مقالات بلاگ"
          }
          return "بلاگ"
        case "analyses":
          return "تحلیل‌ها"
        case "support":
          return "پشتیبانی"
        default:
          return "پنل مدیریت"
      }
    }

    return "پنل مدیریت"
  }

  // Function to generate breadcrumb items based on the pathname
  const getBreadcrumbItems = () => {
    const splittedPathname = pathname.split("/")
    splittedPathname.splice(0, 2)
    const path = splittedPathname.filter(Boolean)
    console.log(pathname, "pathname")
    const items: { title: React.ReactNode }[] = [
      {
        title: <Link href="/admin/dashboard">داشبورد</Link>,
      },
    ]

    if (path.length >= 2 && path[1] !== "dashboard") {
      switch (path[1]) {
        case "users":
          items.push({
            title: "مدیریت کاربران",
          })
          break
        case "subscription-plans":
          items.push({
            title: "مدیریت اشتراک‌ها",
          })
          break
        case "blog":
          items.push({
            title: <Link href="/admin/dashboard/blog/posts">بلاگ</Link>,
          })

          if (path.length === 3) {
            if (path[2] === "categories") {
              items.push({
                title: "دسته‌بندی‌ها",
              })
            } else if (path[2] === "posts") {
              items.push({
                title: "مقالات",
              })
            }
          }
          break
        case "analyses":
          items.push({
            title: "تحلیل‌ها",
          })
          break
        case "support":
          items.push({
            title: "پشتیبانی",
          })
          break
      }
    }

    return items
  }

  const items = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: <Link href="/admin/dashboard">داشبورد</Link>,
    },
    {
      key: "/admin/dashboard/users",
      icon: <UserOutlined />,
      label: <Link href="/admin/dashboard/users">مدیریت کاربران</Link>,
    },
    {
      key: "consultants",
      icon: <UserOutlined />,
      label: "مشاوران",
      children: [
        {
          key: "/admin/dashboard/consultants",
          icon: <UserOutlined />,
          label: <Link href="/admin/dashboard/consultants">مدیریت مشاوران</Link>,
        },
        {
          key: "/admin/dashboard/consultants/reservations",
          icon: <UserOutlined />,
          label: <Link href="/admin/dashboard/consultants/reservations">مدیریت درخواست‌ها</Link>,
        },
      ],
    },
    {
      key: "/admin/dashboard/subscription-plans",
      icon: <CrownOutlined />,
      label: <Link href="/admin/dashboard/subscription-plans">مدیریت اشتراک‌ها</Link>,
    },
    {
      key: "/admin/dashboard/deposits",
      icon: <MoneyCollectOutlined />,
      label: <Link href="/admin/dashboard/deposits">درخواست‌های واریز</Link>,
    },
    {
      key: "blog",
      icon: <ReadOutlined />,
      label: "بلاگ",
      children: [
        {
          key: "/admin/dashboard/blog/categories",
          icon: <BarsOutlined />,
          label: <Link href="/admin/dashboard/blog/categories">دسته‌بندی‌ها</Link>,
        },
        {
          key: "/admin/dashboard/blog/posts",
          icon: <ReadOutlined />,
          label: <Link href="/admin/dashboard/blog/posts">مقالات</Link>,
        },
      ],
    },
    {
      key: "/admin/dashboard/analyses",
      icon: <LineChartOutlined />,
      label: <Link href="/admin/dashboard/analyses">تحلیل‌ها</Link>,
    },
    {
      key: "/admin/dashboard/projects",
      icon: <SearchOutlined />,
      label: <Link href="/admin/dashboard/projects">پروژه‌ها</Link>,
    },
    {
      key: "/admin/dashboard/support",
      icon: <CustomerServiceOutlined />,
      label: <Link href="/admin/dashboard/support">پشتیبانی</Link>,
    },
    {
      key: "/admin/dashboard/mentors",
      icon: <UserOutlined />,
      label: <Link href="/admin/dashboard/mentors">منتورها</Link>,
    },
     {
      key: "/admin/dashboard/ai",
      icon:  <Sparkles className="h-4 w-3" />,
      label: <Link href="/admin/dashboard/ai">هوش مصنوعی </Link>,
    },
  ]

  const navigationItems = [
    {
      title: "داشبورد",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "کاربران",
      href: "/admin/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "تحلیل‌ها",
      href: "/admin/dashboard/analyses",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      title: "بررسی پروژه‌ها",
      href: "/admin/dashboard/projects",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "وبلاگ",
      href: "/admin/dashboard/blog/posts",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "دسته‌بندی‌ها",
      href: "/admin/dashboard/blog/categories",
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      title: "اشتراک‌ها",
      href: "/admin/dashboard/subscription-plans",
      icon: <CreditCard className="h-5 w-5" />,
    },
    // {
    //   title: "دسترسی‌ها",
    //   href: "/admin/dashboard/permissions",
    //   icon: <Lock className="h-5 w-5" />,
    // },
    {
      title: "پشتیبانی",
      href: "/admin/dashboard/support",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ]

  return (
    <Layout style={{ minHeight: "100vh", direction: "rtl" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          borderLeft: "1px solid #f0f0f0",
        }}
      >
        <div className="p-4 flex justify-center items-center">
          {collapsed ? (
            <div className="text-2xl font-bold">T</div>
          ) : (
            <div className="text-xl font-bold">پلاس چارت</div>
          )}
        </div>
        <Menu mode="inline" selectedKeys={[pathname]} style={{ borderLeft: 0 }} items={items} />
      </Sider>
      <Layout style={{ marginRight: collapsed ? 80 : 200, transition: "all 0.2s" }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="flex justify-between items-center px-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <Dropdown
              menu={{
                items: [
                  {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "خروج",
                    onClick: async () => {
                      try {
                        const response = await fetch('/api/admin/auth/logout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include'
                        });

                        if (response.ok) {
                          window.location.href = '/admin/login';
                        } else {
                          console.error('Logout failed:', await response.text());
                        }
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }
                  },
                ],
              }}
              placement="bottomLeft"
            >
              <Space>
                <span>پنل مدیریت</span>
                <Avatar icon={<UserOutlined />} />
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 0,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div className="p-4 border-b">
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
