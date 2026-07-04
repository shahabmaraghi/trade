"use client";
import { Card, Col, Row, Statistic } from "antd"
import { UserOutlined, CrownOutlined, ReadOutlined, LineChartOutlined } from "@ant-design/icons"

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">داشبورد</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="کاربران" value={125} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="اشتراک‌ها" value={45} prefix={<CrownOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="مقالات بلاگ" value={32} prefix={<ReadOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="تحلیل‌ها" value={78} prefix={<LineChartOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
