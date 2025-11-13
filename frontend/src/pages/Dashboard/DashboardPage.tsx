/**
 * Dashboard Page
 */

import { Typography, Card, Row, Col, Statistic } from 'antd'
import { DatabaseOutlined, UnorderedListOutlined } from '@ant-design/icons'

const { Title } = Typography

export function DashboardPage() {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Databases"
              value={0}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
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

