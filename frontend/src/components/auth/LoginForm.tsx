/**
 * Login Form Component
 */

import { Form, Input, Button, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form] = Form.useForm()

  const handleSubmit = async (values: { identity: string; password: string }) => {
    const result = await login(values)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <Form
      form={form}
      name="login"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="identity"
        rules={[
          { required: true, message: 'Please input your username or email!' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Username or Email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Login
        </Button>
      </Form.Item>

      <Space style={{ width: '100%', justifyContent: 'center' }}>
        <span>Don't have an account?</span>
        <Link to="/register">Register</Link>
      </Space>
    </Form>
  )
}

