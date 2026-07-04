'use client'

import { Button, Form, Input, message, Table, Space, Popconfirm, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Mentor {
  _id: string;
  username: string;
  name: string;
  referral_percent: number;
  referralCode?: string;
  wallet?: number;
  createdAt: string;
}

export default function MentorsPage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);

  const fetchMentors = async () => {
    try {
      const { data } = await axios.get('/api/admin/mentors');
      setMentors(data);
    } catch (error) {
      message.error('خطا در دریافت اطلاعات منتورها');
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const mentorData = {
        ...values,
        referral_percent: Number(values.referral_percent) || 0
      };
      
      if (editingMentor) {
        await axios.put(`/api/admin/mentors/${editingMentor._id}`, mentorData);
        message.success('منتور با موفقیت بروزرسانی شد');
      } else {
        await axios.post('/api/admin/mentors', mentorData);
        message.success('منتور با موفقیت اضافه شد');
      }
      form.resetFields();
      setIsModalVisible(false);
      setEditingMentor(null);
      fetchMentors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'خطایی رخ داده است');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/admin/mentors/${id}`);
      message.success('منتور با موفقیت حذف شد');
      fetchMentors();
    } catch (error) {
      message.error('خطا در حذف منتور');
    }
  };

  const handlePasswordChange = async (values: { newPassword: string }) => {
    if (!editingMentor) return;
    
    try {
      setLoading(true);
      await axios.put(`/api/admin/mentors/${editingMentor._id}`, {
        password: values.newPassword
      });
      message.success('رمز عبور با موفقیت بروزرسانی شد');
      setIsPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'خطا در بروزرسانی رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'نام کاربری',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'نام و نام خانوادگی',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'کد معرفی',
      dataIndex: 'referralCode',
      key: 'referralCode',
    },
    {
      title: 'کیف پول',
      dataIndex: 'wallet',
      key: 'wallet',
      render: (val: number) => (val || 0).toLocaleString() + ' تومان',
    },
    {
      title: 'درصد معرفی',
      dataIndex: 'referral_percent',
      key: 'referral_percent',
      render: (percent: number) => `${percent}%`,
    },
    {
      title: 'تاریخ ایجاد',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('fa-IR'),
    },
    {
      title: 'عملیات',
      key: 'actions',
      render: (_: any, record: Mentor) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingMentor(record);
              form.setFieldsValue({
                username: record.username,
                name: record.name,
                referral_percent: record.referral_percent,
              });
              setIsModalVisible(true);
            }}
          />
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => {
              setEditingMentor(record);
              setIsPasswordModalVisible(true);
            }}
          >
            تغییر رمز
          </Button>
          <Popconfirm
            title="آیا از حذف این منتور اطمینان دارید؟"
            onConfirm={() => handleDelete(record._id)}
            okText="بله"
            cancelText="خیر"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>مدیریت منتورها</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingMentor(null);
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          افزودن منتور
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={mentors}
        rowKey="_id"
        loading={loading}
        locale={{ emptyText: 'هیچ منتوری یافت نشد' }}
      />

      <Modal
        title={editingMentor ? 'ویرایش منتور' : 'افزودن منتور جدید'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            label="نام کاربری"
            name="username"
            rules={[{ required: true, message: 'لطفا نام کاربری را وارد کنید' }]}
          >
            <Input placeholder="نام کاربری" />
          </Form.Item>

          <Form.Item
            label="نام و نام خانوادگی"
            name="name"
            rules={[{ required: true, message: 'لطفا نام و نام خانوادگی را وارد کنید' }]}
          >
            <Input placeholder="نام و نام خانوادگی" />
          </Form.Item>

          <Form.Item
            label="درصد معرفی (0-100)"
            name="referral_percent"
          >
            <Input type="number" min={0} max={100} placeholder="درصد معرفی" addonAfter="%" />
          </Form.Item>

          {!editingMentor && (
            <Form.Item
              label="رمز عبور"
              name="password"
              rules={[
                { required: true, message: 'لطفا رمز عبور را وارد کنید' },
                { min: 6, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
              ]}
            >
              <Input.Password placeholder="رمز عبور" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingMentor ? 'بروزرسانی' : 'ذخیره'}
            </Button>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              انصراف
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        title={`تغییر رمز عبور ${editingMentor?.name || ''}`}
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="newPassword"
            label="رمز عبور جدید"
            rules={[
              { required: true, message: 'لطفا رمز عبور جدید را وارد کنید' },
              { min: 6, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
            ]}
          >
            <Input.Password placeholder="رمز عبور جدید" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="تکرار رمز عبور جدید"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'لطفا تکرار رمز عبور را وارد کنید' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('رمزهای عبور وارد شده یکسان نیستند'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="تکرار رمز عبور جدید" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              تغییر رمز عبور
            </Button>
            <Button 
              onClick={() => {
                setIsPasswordModalVisible(false);
                passwordForm.resetFields();
              }} 
              style={{ marginRight: 8 }}
            >
              انصراف
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
