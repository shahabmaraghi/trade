"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Select,
  Input,
  message,
  Badge,
  Tooltip,
  Tabs,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

// Helpers: date/time without external libs
const pad2 = (n: number | string) => String(n).padStart(2, "0");

// Parse "YYYY-MM-DD" as local date to avoid timezone shift
const parseYMDToLocalDate = (ymd: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Fallback for non-YYYY-MM-DD strings or ISO strings
  return new Date(ymd);
};

const toISODateStringLocal = (date: Date): string => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

const todayYMD = (): string => toISODateStringLocal(new Date());

const normalizeIncomingDateToYMD = (value: any): string => {
  if (!value) return todayYMD();
  if (typeof value === "string") {
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (ymd.test(value)) return value;
    const d = new Date(value);
    if (!isNaN(d.getTime())) return toISODateStringLocal(d);
  } else if (value instanceof Date && !isNaN(value.getTime())) {
    return toISODateStringLocal(value);
  }
  return todayYMD();
};

const normalizeTimeString = (input: any): string => {
  if (typeof input !== "string") return "09:00";
  const match = input.match(/(\d{1,2}):(\d{1,2})/);
  if (!match) return "09:00";
  let h = Number(match[1]);
  let m = Number(match[2]);
  if (isNaN(h) || isNaN(m)) return "09:00";
  h = Math.min(Math.max(h, 0), 23);
  m = Math.min(Math.max(m, 0), 59);
  return `${pad2(h)}:${pad2(m)}`;
};

const formatDateFaJalali = (ymd: string): string => {
  const d = parseYMDToLocalDate(ymd);
  if (isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<any>(null);
  const [form] = Form.useForm();
  // Default active: paid and not completed
  const [activeTab, setActiveTab] = useState("paid_not_completed");

  // antd v5: use hooks instead of static APIs
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, modalContextHolder] = Modal.useModal();
  const [phone, setPhone] = useState("");
  useEffect(() => {
    fetchReservations();
    fetchConsultants();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations");

      if (!response.ok) {
        throw new Error("Failed to fetch reservations");
      }

      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      messageApi.error("خطا در دریافت اطلاعات رزروها");
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await fetch("/api/consultants");

      if (!response.ok) {
        throw new Error("Failed to fetch consultants");
      }

      const data = await response.json();
      setConsultants(data);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      messageApi.error("خطا در دریافت اطلاعات مشاوران");
    }
  };

  const showModal = (reservation: any = null) => {
    setCurrentReservation(reservation);

    if (reservation) {
      form.setFieldsValue({
        userName: reservation.userId?.fullName || reservation.userName,
        userPhone: reservation.userId?.phone || reservation.userPhone,
        consultantId: reservation.consultantId?._id || reservation.consultantId,
        date: normalizeIncomingDateToYMD(reservation.date),
        time: normalizeTimeString(reservation.time),
        type: reservation.type,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        paymentAmount: reservation.paymentAmount,
        paymentTransactionId: reservation.paymentTransactionId,
        notes: reservation.notes,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        date: todayYMD(),
        time: "09:00",
        type: "online",
        status: "pending",
        paymentStatus: "pending",
      });
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentReservation(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Normalize date and time to string formats
      const formattedDate = normalizeIncomingDateToYMD(values.date);
      const formattedTime = normalizeTimeString(values.time);

      // Prepare data for API
      const reservationData = {
        ...values,
        date: formattedDate,
        time: formattedTime,
        paymentAmount: values.paymentAmount
          ? Number(values.paymentAmount)
          : undefined,
      };

      // API call
      const url = currentReservation
        ? `/api/reservations/${currentReservation._id}`
        : "/api/reservations";
      const method = currentReservation ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error("Failed to save reservation");
      }

      const data = await response.json();

      // Update state
      if (currentReservation) {
        setReservations(
          reservations.map((r) =>
            r._id === currentReservation._id ? data : r,
          ),
        );
        messageApi.success("اطلاعات رزرو با موفقیت بروزرسانی شد");
      } else {
        setReservations([...reservations, data]);
        messageApi.success("رزرو جدید با موفقیت اضافه شد");
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      messageApi.error("خطا در ذخیره اطلاعات رزرو");
    } finally {
      setLoading(false);
      setIsModalVisible(false);
      setCurrentReservation(null);
    }
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: "آیا از حذف این رزرو مطمئن هستید؟",
      content: "این عملیات قابل بازگشت نیست.",
      okText: "بله، حذف شود",
      cancelText: "انصراف",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);

          const response = await fetch(`/api/reservations/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete reservation");
          }

          // Remove reservation from state
          setReservations(reservations.filter((r) => r._id !== id));
          messageApi.success("رزرو با موفقیت حذف شد");
        } catch (error) {
          console.error("Error deleting reservation:", error);
          messageApi.error("خطا در حذف رزرو");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleMarkAsCompleted = async (id: string) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reservation");
      }

      const data = await response.json();

      // Update reservation in state
      setReservations(reservations.map((r) => (r._id === id ? data : r)));
      messageApi.success("وضعیت رزرو با موفقیت به 'انجام شده' تغییر یافت");
    } catch (error) {
      console.error("Error updating reservation:", error);
      messageApi.error("خطا در بروزرسانی وضعیت رزرو");
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            در انتظار تایید
          </Tag>
        );
      case "confirmed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            تایید شده
          </Tag>
        );
      case "completed":
        return (
          <Tag icon={<CheckCircleOutlined />} color="blue">
            انجام شده
          </Tag>
        );
      case "cancelled":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            لغو شده
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getPaymentStatusTag = (status: string) => {
    switch (status) {
      case "paid":
        return <Tag color="success">پرداخت شده</Tag>;
      case "pending":
        return <Tag color="warning">در انتظار پرداخت</Tag>;
      case "failed":
        return <Tag color="error">ناموفق</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "نام کاربر",
      dataIndex: ["userId", "fullName"],
      key: "userName",
      render: (text: string, record: any) => (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>{text || record.userName}</span>
        </div>
      ),
    },
    {
      title: "مشاور",
      dataIndex: ["consultantId", "name"],
      key: "consultantName",
      render: (text: string, record: any) =>
        text || record?.consultantId?.name || record?.consultantName,
    },
    {
      title: "تاریخ",
      dataIndex: "date",
      key: "date",
      render: (dateVal: string) => {
        const persianDate = formatDateFaJalali(
          normalizeIncomingDateToYMD(dateVal),
        );
        return (
          <div className="flex items-center gap-2">
            <CalendarOutlined />
            <span>{persianDate}</span>
          </div>
        );
      },
    },
    {
      title: "ساعت",
      dataIndex: "time",
      key: "time",
      render: (time: string) => (
        <div className="flex items-center gap-2">
          <ClockCircleOutlined />
          <span>{normalizeTimeString(time)}</span>
        </div>
      ),
    },
    {
      title: "نوع مشاوره",
      dataIndex: "type",
      key: "type",
      render: (type: string) =>
        type === "online" ? (
          <Tag color="green">آنلاین</Tag>
        ) : (
          <Tag color="blue">حضوری</Tag>
        ),
    },
    {
      title: "وضعیت",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "وضعیت پرداخت",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status: string) => getPaymentStatusTag(status),
    },
    {
      title: "مبلغ",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (amount: number) => (
        <span>{(amount ?? 0).toLocaleString("fa-IR")} تومان</span>
      ),
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="مشاهده جزئیات">
            <Button
              type="default"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="ویرایش رزرو">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          {record.status === "confirmed" && (
            <Tooltip title="تکمیل مشاوره">
              <Button
                type="primary"
                style={{ backgroundColor: "#1890ff" }}
                shape="circle"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsCompleted(record._id)}
              />
            </Tooltip>
          )}
          <Tooltip title="حذف رزرو">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter reservations based on active tab (simplified with priority tab first)
  const getFilteredReservations = () => {
    switch (activeTab) {
      case "paid_not_completed":
        return reservations.filter(
          (r) => r.paymentStatus === "paid" && r.status !== "completed",
        );
      case "payment_pending":
        return reservations.filter((r) => r.paymentStatus === "pending");
      case "completed":
        return reservations.filter((r) => r.status === "completed");
      case "all":
      default:
        return reservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  // Simplified tabs: paid_not_completed first, "all" moved to the end
  const tabsItems = [
    {
      key: "paid_not_completed",
      label: (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>پرداخت‌شده و ناتمام</span>
          <Badge
            count={
              reservations.filter(
                (r) => r.paymentStatus === "paid" && r.status !== "completed",
              ).length
            }
            showZero
            style={{ backgroundColor: "#52c41a" }}
          />
        </div>
      ),
    },
    {
      key: "payment_pending",
      label: (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>در انتظار پرداخت</span>
          <Badge
            count={
              reservations.filter((r) => r.paymentStatus === "pending").length
            }
            showZero
            style={{ backgroundColor: "#faad14" }}
          />
        </div>
      ),
    },
    {
      key: "completed",
      label: (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>انجام شده</span>
          <Badge
            count={reservations.filter((r) => r.status === "completed").length}
            showZero
            style={{ backgroundColor: "#1890ff" }}
          />
        </div>
      ),
    },
    {
      key: "all",
      label: (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>همه</span>
          <Badge
            count={reservations.length}
            showZero
            style={{ backgroundColor: "#595959" }}
          />
        </div>
      ),
    },
  ];
  const toPersianDigits = (value: string) => {
    return value.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
  };

  const toEnglishDigits = (value: string) => {
    return value
      .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  };
  return (
    <>
      {messageContextHolder}
      {modalContextHolder}

      <div className="p-6">
        <Card
          title="مدیریت رزروهای مشاوره"
          extra={
            <Button type="primary" onClick={() => showModal()}>
              افزودن رزرو جدید
            </Button>
          }
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabsItems}
            style={{ marginBottom: 16 }}
          />

          <Table
            columns={columns}
            dataSource={filteredReservations}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `مجموع ${total} رزرو`,
            }}
          />
        </Card>

        {/* Add/Edit Reservation Modal */}
        <Modal
          title={
            currentReservation ? "ویرایش اطلاعات رزرو" : "افزودن رزرو جدید"
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="userName"
              label="نام کاربر"
              rules={[
                { required: true, message: "لطفاً نام کاربر را وارد کنید" },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="نام و نام خانوادگی کاربر"
              />
            </Form.Item>

            <Form.Item
              name="userPhone"
              label="شماره تماس کاربر"
              rules={[
                {
                  required: true,
                  message: "لطفاً شماره تماس کاربر را وارد کنید",
                },
                {
                  pattern: /^09\d{9}$/,
                  message: "شماره تماس باید با 09 شروع شده و 11 رقم باشد",
                },
              ]}
            >
              <Input
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
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

            <Form.Item
              name="consultantId"
              label="انتخاب مشاور"
              rules={[
                { required: true, message: "لطفاً مشاور را انتخاب کنید" },
              ]}
            >
              <Select
                placeholder="انتخاب مشاور"
                showSearch
                optionFilterProp="label"
                options={consultants.map((consultant) => ({
                  label: consultant.name,
                  value: consultant._id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="date"
              label="تاریخ مشاوره"
              rules={[
                {
                  required: true,
                  message: "لطفاً تاریخ مشاوره را انتخاب کنید",
                },
              ]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              name="time"
              label="ساعت مشاوره"
              rules={[
                { required: true, message: "لطفاً ساعت مشاوره را انتخاب کنید" },
              ]}
            >
              <Input type="time" step={60} />
            </Form.Item>

            <Form.Item
              name="type"
              label="نوع مشاوره"
              rules={[
                { required: true, message: "لطفاً نوع مشاوره را انتخاب کنید" },
              ]}
            >
              <Select
                placeholder="انتخاب نوع مشاوره"
                options={[
                  { value: "online", label: "آنلاین" },
                  { value: "offline", label: "حضوری" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="وضعیت"
              rules={[
                { required: true, message: "لطفاً وضعیت را انتخاب کنید" },
              ]}
            >
              <Select
                placeholder="انتخاب وضعیت"
                options={[
                  { value: "pending", label: "در انتظار تایید" },
                  { value: "confirmed", label: "تایید شده" },
                  { value: "completed", label: "انجام شده" },
                  { value: "cancelled", label: "لغو شده" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="paymentStatus"
              label="وضعیت پرداخت"
              rules={[
                {
                  required: true,
                  message: "لطفاً وضعیت پرداخت را انتخاب کنید",
                },
              ]}
            >
              <Select
                placeholder="انتخاب وضعیت پرداخت"
                options={[
                  { value: "pending", label: "در انتظار پرداخت" },
                  { value: "paid", label: "پرداخت شده" },
                  { value: "failed", label: "ناموفق" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="paymentAmount"
              label="مبلغ پرداختی (تومان)"
              rules={[
                { required: true, message: "لطفاً مبلغ پرداختی را وارد کنید" },
              ]}
            >
              <Input type="number" placeholder="مثال: 500000" min={0} />
            </Form.Item>

            <Form.Item name="paymentTransactionId" label="شناسه تراکنش">
              <Input placeholder="شناسه تراکنش پرداخت" />
            </Form.Item>

            <Form.Item name="notes" label="یادداشت">
              <Input.TextArea
                rows={4}
                placeholder="یادداشت یا توضیحات اضافی..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0 text-left">
              <Space>
                <Button onClick={handleCancel}>انصراف</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {currentReservation ? "بروزرسانی" : "افزودن"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}
