/**
 * Login Page
 */

import { Card, Typography } from 'antd'
import { LoginForm } from '../../components/auth/LoginForm'

const { Title } = Typography

export function LoginPage() {
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
          Login
        </Title>
        <LoginForm />
      </Card>
    </div>
  )
}

