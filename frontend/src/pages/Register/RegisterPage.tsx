/**
 * Register Page
 */

import { Card, Typography } from 'antd'
import { RegisterForm } from '../../components/auth/RegisterForm'

const { Title } = Typography

export function RegisterPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
          Register
        </Title>
        <RegisterForm />
      </Card>
    </div>
  )
}

