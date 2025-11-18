/**
 * Dashboard Page
 */

import { Typography, Card, Row, Col, Statistic } from 'antd'
import { DatabaseOutlined, UnorderedListOutlined } from '@ant-design/icons'

const { Title } = Typography

export function DashboardPage() {
  return (
    <div style={{ width: '100%' }}>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <Statistic
              title="Databases"
              value={0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Card>
            <Statistic
              title="Indexes"
              value={0}
              prefix={<UnorderedListOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

