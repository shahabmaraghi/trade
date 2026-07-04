"use client"

import { useState, useEffect } from "react"
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Space,
  Tag,
  Tooltip,
  message,
  Card,
  Tabs,
  TimePicker,
  Checkbox,
  Row,
  Col,
  Divider,
  Upload,
  Popconfirm,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons"
import dayjs from "dayjs"
import Image from "next/image"

type CheckboxValueType = string | number | boolean

const { TabPane } = Tabs
const { TextArea } = Input

// Persian weekdays
const weekdays = [
  { label: "شنبه", value: "شنبه" },
  { label: "یکشنبه", value: "یکشنبه" },
  { label: "دوشنبه", value: "دوشنبه" },
  { label: "سه‌شنبه", value: "سه‌شنبه" },
  { label: "چهارشنبه", value: "چهارشنبه" },
  { label: "پنجشنبه", value: "پنجشنبه" },
  { label: "جمعه", value: "جمعه" },
]

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false)
  const [currentConsultant, setCurrentConsultant] = useState<any>(null)
  const [form] = Form.useForm()
  const [scheduleForm] = Form.useForm()
  const [selectedDays, setSelectedDays] = useState<CheckboxValueType[]>([])
  const [activeTab, setActiveTab] = useState("1")
  const [uploadLoading, setUploadLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>("")

  // Reset form when currentConsultant changes
  useEffect(() => {
    if (currentConsultant) {
      // Set image URL state
      setImageUrl(currentConsultant.image || "")

      // Set form values with all fields including email and phone
      form.setFieldsValue({
        name: currentConsultant.name || '',
        email: currentConsultant.email || '',
        phone: currentConsultant.phone || '',
        specialty: currentConsultant.specialty || '',
        bio: currentConsultant.bio || '',
        offlineAvailable: currentConsultant.offlineAvailable !== undefined ? currentConsultant.offlineAvailable : false,
        onlineAvailable: currentConsultant.onlineAvailable !== undefined ? currentConsultant.onlineAvailable : true,
        active: currentConsultant.active !== undefined ? currentConsultant.active : true,
        fee: currentConsultant.fee || 0,
        image: currentConsultant.image || ''
      })
    } else if (isModalVisible) {
      // Reset form with default values for new consultant
      form.resetFields()
      form.setFieldsValue({
        offlineAvailable: false,
        onlineAvailable: true,
        active: true,
        fee: 0,
        image: ''
      })
      setImageUrl("")
    }
  }, [currentConsultant, isModalVisible, form])

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/consultants")

      if (!response.ok) {
        throw new Error("Failed to fetch consultants")
      }

      const data = await response.json()
      setConsultants(data)
    } catch (error) {
      console.error("Error fetching consultants:", error)
      message.error("خطا در دریافت اطلاعات مشاوران")
    } finally {
      setLoading(false)
    }
  }

  const showModal = (consultant = null) => {
    setCurrentConsultant(consultant)
    setIsModalVisible(true)
  }

  const showScheduleModal = (consultant: any) => {
    setCurrentConsultant(consultant)

    // Set selected days based on consultant schedule
    const days = consultant.schedule ? Object.keys(consultant.schedule) : []
    setSelectedDays(days)

    // Set form values for each day
    scheduleForm.resetFields()

    if (consultant.schedule) {
      const formValues: any = {}

      Object.entries(consultant.schedule).forEach(([day, times]: [string, any]) => {
        formValues[`${day}_start`] = dayjs(times.start, "HH:mm")
        formValues[`${day}_end`] = dayjs(times.end, "HH:mm")
      })

      scheduleForm.setFieldsValue(formValues)
    }

    setIsScheduleModalVisible(true)
  }

  const handleCancel = () => {
    // Reset form and state when modal is closed
    form.resetFields()
    setCurrentConsultant(null)
    setImageUrl("")
    setIsModalVisible(false)
    setIsScheduleModalVisible(false)
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)

      // Add image URL if available
      if (imageUrl) {
        values.image = imageUrl
      }

      const url = currentConsultant ? `/api/consultants/${currentConsultant._id}` : "/api/consultants"

      const method = currentConsultant ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to save consultant")
      }

      const data = await response.json()

      if (currentConsultant) {
        // Update existing consultant in state
        setConsultants(consultants.map((c) => (c._id === currentConsultant._id ? data : c)))
        message.success("اطلاعات مشاور با موفقیت بروزرسانی شد")
      } else {
        // Add new consultant to state
        setConsultants([...consultants, data])
        message.success("مشاور جدید با موفقیت اضافه شد")
      }

      handleCancel()
    } catch (error) {
      console.error("Error saving consultant:", error)
      message.error("خطا در ذخیره اطلاعات مشاور")
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleSubmit = async (values: any) => {
    try {
      setLoading(true)

      // Create schedule object from form values
      const schedule: any = {}

      selectedDays.forEach((day: any) => {
        const startTime = values[`${day}_start`]
        const endTime = values[`${day}_end`]

        if (startTime && endTime) {
          schedule[day] = {
            start: startTime.format("HH:mm"),
            end: endTime.format("HH:mm"),
          }
        }
      })

      // Update consultant schedule
      const response = await fetch(`/api/consultants/schedule/${currentConsultant._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ schedule }),
      })

      if (!response.ok) {
        throw new Error("Failed to update schedule")
      }

      const data = await response.json()

      // Update consultant in state
      setConsultants(consultants.map((c) => (c._id === currentConsultant._id ? data : c)))
      message.success("برنامه زمانی مشاور با موفقیت بروزرسانی شد")
      
      handleCancel()
    } catch (error) {
      console.error("Error saving schedule:", error)
      message.error("خطا در ذخیره برنامه زمانی مشاور")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/consultants/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete consultant")
      }

      // Remove consultant from state
      setConsultants(consultants.filter((c) => c._id !== id))
      message.success(result.message || "مشاور با موفقیت حذف شد")
    } catch (error: any) {
      console.error("Error deleting consultant:", error)
      message.error(error.message || "خطا در حذف مشاور")
    } finally {
      setLoading(false)
    }
  }

  const handleDayChange = (checkedValues: CheckboxValueType[]) => {
    setSelectedDays(checkedValues)
  }

  const handleImageUpload = async (options: any) => {
    const { file, onSuccess, onError } = options

    try {
      setUploadLoading(true)

      // Create form data
      const formData = new FormData()
      formData.append("file", file)

      // Upload to your server
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const data = await response.json()
      setImageUrl(data.url)
      message.success("تصویر با موفقیت آپلود شد")
      onSuccess("ok", file)
    } catch (error) {
      console.error("Error uploading image:", error)
      message.error("خطا در آپلود تصویر")
      onError(error)
    } finally {
      setUploadLoading(false)
    }
  }

  const columns = [
    {
      title: "نام",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            <Image
              src={record.image || "/placeholder.svg?height=40&width=40&query=person"}
              alt={text}
              className="w-full h-full object-cover"
            />
          </div>
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "تخصص",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "امتیاز",
      dataIndex: "rating",
      key: "rating",
      render: (rating: number) => (
        <div className="flex items-center">
          <StarOutlined style={{ color: "#FFD700", marginRight: 5 }} />
          <span>{rating ? rating.toFixed(1) : "0.0"}</span>
        </div>
      ),
    },
    {
      title: "هزینه مشاوره",
      dataIndex: "fee",
      key: "fee",
      render: (fee: number) => <span>{fee ? fee.toLocaleString() : "0"} تومان</span>,
    },
    {
      title: "مشاوره حضوری",
      dataIndex: "offlineAvailable",
      key: "offlineAvailable",
      render: (available: boolean) => (available ? <Tag color="green">فعال</Tag> : <Tag color="red">غیرفعال</Tag>),
    },
    {
      title: "مشاوره آنلاین",
      dataIndex: "onlineAvailable",
      key: "onlineAvailable",
      render: (available: boolean) => (available ? <Tag color="green">فعال</Tag> : <Tag color="red">غیرفعال</Tag>),
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="ویرایش مشاور">
            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="تنظیم برنامه زمانی">
            <Button
              type="default"
              shape="circle"
              icon={<CalendarOutlined />}
              onClick={() => showScheduleModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="حذف مشاور"
            description="آیا از حذف این مشاور و تمامی رزروهای مرتبط اطمینان دارید؟"
            okText="بله، حذف کن"
            cancelText="انصراف"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="حذف مشاور">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<DeleteOutlined />}
                loading={loading}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6">
      <Card
        title="مدیریت مشاوران"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
            افزودن مشاور جدید
          </Button>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="لیست مشاوران" key="1">
            <Table
              columns={columns}
              dataSource={consultants}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Consultant Modal */}
      <Modal
        title={currentConsultant ? "ویرایش اطلاعات مشاور" : "افزودن مشاور جدید"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="نام و نام خانوادگی"
                rules={[{ required: true, message: "لطفاً نام مشاور را وارد کنید" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="نام و نام خانوادگی مشاور" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialty"
                label="تخصص"
                rules={[{ required: true, message: "لطفاً تخصص مشاور را وارد کنید" }]}
              >
                <Input placeholder="مثال: تحلیل بازار سرمایه" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fee"
                label="هزینه مشاوره (تومان)"
                rules={[{ required: true, message: "لطفاً هزینه مشاوره را وارد کنید" }]}
              >
                <Input type="number" placeholder="مثال: 500000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="تصویر مشاور">
                <Upload
                  name="image"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  customRequest={handleImageUpload}
                  accept="image/png,image/jpeg,image/jpg"
                >
                  {imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt="avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {uploadLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                          در حال آپلود...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {uploadLoading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                          <div>در حال آپلود...</div>
                        </div>
                      ) : (
                        <>
                          <UploadOutlined style={{ fontSize: 24 }} />
                          <div style={{ marginTop: 8 }}>آپلود تصویر</div>
                        </>
                      )}
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bio"
            label="بیوگرافی"
            rules={[{ required: true, message: "لطفاً بیوگرافی مشاور را وارد کنید" }]}
          >
            <TextArea rows={4} placeholder="توضیحات مختصر درباره سوابق و تخصص‌های مشاور..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="offlineAvailable" label="امکان مشاوره حضوری" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="onlineAvailable" label="امکان مشاوره آنلاین" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>انصراف</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {currentConsultant ? "بروزرسانی" : "افزودن"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        title={`تنظیم برنامه زمانی ${currentConsultant?.name || ""}`}
        open={isScheduleModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleSubmit}>
          <div className="mb-4">
            <p className="mb-2">روزهای فعالیت:</p>
            <Checkbox.Group options={weekdays} value={selectedDays} onChange={handleDayChange} />
          </div>

          <Divider />

          {selectedDays.map((day: any) => (
            <div key={day} className="mb-4">
              <h4 className="mb-3 flex items-center">
                <ClockCircleOutlined style={{ marginLeft: 8 }} />
                {day}
              </h4>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name={`${day}_start`}
                    label="ساعت شروع"
                    rules={[{ required: true, message: "لطفاً ساعت شروع را انتخاب کنید" }]}
                  >
                    <TimePicker format="HH:mm" placeholder="انتخاب ساعت" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={`${day}_end`}
                    label="ساعت پایان"
                    rules={[{ required: true, message: "لطفاً ساعت پایان را انتخاب کنید" }]}
                  >
                    <TimePicker format="HH:mm" placeholder="انتخاب ساعت" style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}

          {selectedDays.length === 0 && (
            <div className="text-center p-4 text-gray-500">لطفاً حداقل یک روز را انتخاب کنید.</div>
          )}

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={handleCancel}>انصراف</Button>
              <Button type="primary" htmlType="submit" loading={loading} disabled={selectedDays.length === 0}>
                ذخیره برنامه زمانی
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}