"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  DatePicker,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

// Define the user type
interface User {
  _id: string;
  phone: string;
  fullName: string;
  referrer: string;
  referrerName?: string;
  role: "admin" | "user";
  subscriptionPlan: {
    _id: string;
    name: string;
  };
  subscriptionExpiry?: Date;
  hasPassword: boolean;
  createdAt: Date;
}

// Define the subscription plan type
interface SubscriptionPlan {
  _id: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [phoneQuery, setPhoneQuery] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [debouncedPhone, setDebouncedPhone] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [phone, setPhone] = useState("");
  // Fetch users and subscription plans on component mount
  useEffect(() => {
    fetchUsers();
    fetchSubscriptionPlans();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedPhone(phoneQuery);
      setDebouncedName(nameQuery);
      setPagination((p) => ({ ...p, current: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [phoneQuery, nameQuery]);

  useEffect(() => {
    fetchUsers();
  }, [debouncedPhone, debouncedName, pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedPhone) params.set("phone", debouncedPhone);
      if (debouncedName) params.set("fullName", debouncedName);
      params.set("page", String(pagination.current));
      params.set("limit", String(pagination.pageSize));
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include credentials for cookies
      });

      if (response.status === 401) {
        messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید");
        // Optionally redirect to login
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
      if (data.pagination?.total !== undefined) {
        setPagination((p) => ({ ...p, total: data.pagination.total }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      messageApi.error("خطا در دریافت اطلاعات کاربران");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch("/api/admin/subscriptions/plans", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials
      });

      if (response.status === 401) {
        messageApi.error("جلسه شما منقضی شده است. لطفا دوباره وارد شوید");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      messageApi.error("خطا در دریافت اطلاعات اشتراک‌ها");
    }
  };

  // Add a new function to assign free plan
  const assignFreePlan = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/subscriptions/assign-free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign free plan");
      }

      messageApi.success("اشتراک رایگان با موفقیت اختصاص داده شد");
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Error assigning free plan:", error);
      messageApi.error(error.message || "خطا در اختصاص اشتراک رایگان");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "شماره موبایل",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "نام و نام خانوادگی",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => text || "تعیین نشده",
    },
    {
      title: "معرف",
      dataIndex: "referrer",
      key: "referrer",
      render: (_: any, record: User) => {
        const name =
          record.referrerName && record.referrerName.trim()
            ? record.referrerName
            : "";
        const code =
          record.referrer && record.referrer.trim() ? record.referrer : "";
        if (name && code) return <span title={code}>{name}</span>;
        if (name) return name;
        if (code) return code;
        return "ندارد";
      },
    },
    {
      title: "نقش",
      dataIndex: "role",
      key: "role",
      render: (text: string) => (text === "admin" ? "مدیر" : "کاربر"),
    },
    {
      title: "اشتراک",
      dataIndex: ["subscriptionPlan", "name"],
      key: "subscriptionPlan",
    },
    {
      title: "تاریخ انقضا",
      dataIndex: "subscriptionExpiry",
      key: "subscriptionExpiry",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("fa-IR") : "ندارد",
    },
    // {
    //   title: "رمز عبور",
    //   dataIndex: "hasPassword",
    //   key: "hasPassword",
    //   render: (hasPassword: boolean) => (hasPassword ? "دارد" : "ندارد"),
    // },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          {/* <Button
            type="primary"
            onClick={() => assignFreePlan(record._id)}
            disabled={record.subscriptionPlan?._id === "free"}
          >
            اختصاص اشتراک رایگان
          </Button> */}
          <Popconfirm
            title="آیا از حذف این کاربر اطمینان دارید؟"
            onConfirm={() => handleDelete(record._id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);

    form.setFieldsValue({
      phone: user.phone,
      fullName: user.fullName || "",
      referrer: user.referrer || "",
      role: user.role,
      subscriptionPlanId: user.subscriptionPlan?._id,
      subscriptionExpiry: user.subscriptionExpiry
        ? dayjs(user.subscriptionExpiry)
        : undefined,
      password: "", // Don't show existing password
    });

    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      messageApi.success("کاربر با موفقیت حذف شد");
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting user:", error);
      messageApi.error(error.message || "خطا در حذف کاربر");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      const userData = {
        phone: values.phone,
        fullName: values.fullName,
        referrer: values.referrer,
        role: values.role,
        subscriptionPlanId: values.subscriptionPlanId,
        subscriptionExpiry: values.subscriptionExpiry
          ? values.subscriptionExpiry.toISOString()
          : undefined,
        password: values.password, // Will be hashed on the server
      };

      if (editingUser) {
        // Update existing user
        const response = await fetch(`/api/admin/users/${editingUser._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update user");
        }

        messageApi.success("کاربر با موفقیت ویرایش شد");
      } else {
        // Add new user
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create user");
        }

        messageApi.success("کاربر با موفقیت اضافه شد");
      }

      setIsModalVisible(false);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Error saving user:", error);
      messageApi.error(error.message || "خطا در ذخیره کاربر");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const toPersianDigits = (value: string) => {
    return value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  };

  const toEnglishDigits = (value: string) => {
    return value
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  };
  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="جستجو شماره موبایل"
            allowClear
            value={phoneQuery}
            onChange={(e) => setPhoneQuery(e.target.value)}
            style={{ width: 180 }}
          />
          <Input
            placeholder="جستجو نام و نام خانوادگی"
            allowClear
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAdd}>
            افزودن کاربر
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={(pg) =>
            setPagination({
              current: pg.current || 1,
              pageSize: pg.pageSize || 10,
              total: pagination.total,
            })
          }
        />
      </Card>

      <Modal
        title={editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "ویرایش" : "افزودن"}
        cancelText="انصراف"
      >
        <Form form={form} layout="vertical" initialValues={{ role: "user" }}>
          <Form.Item
            name="phone"
            label="شماره موبایل"
            rules={[
              { required: true, message: "لطفا شماره موبایل را وارد کنید!" },
            ]}
          >
            <Input
              placeholder="مثال: 09121234567"
              maxLength={11}
              inputMode="numeric"
              value={toPersianDigits(phone)}
              onChange={(e) => {
                const value = toEnglishDigits(e.target.value)
                  .replace(/\D/g, "")
                  .slice(0, 11);

                setPhone(value);
              }}
            />
          </Form.Item>

          <Form.Item name="fullName" label="نام و نام خانوادگی">
            <Input placeholder="اختیاری" />
          </Form.Item>

          <Form.Item name="referrer" label="معرف">
            <Input placeholder="اختیاری" />
          </Form.Item>

          <Form.Item name="role" label="نقش" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">مدیر</Select.Option>
              <Select.Option value="user">کاربر</Select.Option>
            </Select>
          </Form.Item>

          {/* <Form.Item
            name="subscriptionPlanId"
            label="اشتراک"
            rules={[{ required: true, message: "لطفا اشتراک را انتخاب کنید!" }]}
          >
            <Select>
              {plans.map((plan) => (
                <Select.Option key={plan._id} value={plan._id}>
                  {plan.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subscriptionExpiry" label="تاریخ انقضا">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item> */}

          <Form.Item
            name="password"
            label="رمز عبور"
            extra={
              form.getFieldValue("role") === "admin"
                ? "رمز عبور برای کاربران مدیر الزامی است"
                : ""
            }
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (
                    getFieldValue("role") === "admin" &&
                    (!value || value.length < 6) &&
                    !editingUser
                  ) {
                    return Promise.reject(
                      new Error(
                        "رمز عبور برای مدیران الزامی است و باید حداقل 6 کاراکتر باشد",
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password
              placeholder={
                editingUser
                  ? "برای تغییر رمز عبور، رمز جدید را وارد کنید"
                  : "رمز عبور را وارد کنید"
              }
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
