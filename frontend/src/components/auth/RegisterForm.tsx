/**
 * Register Form Component
 */

import { Form, Input, Button, Space } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form] = Form.useForm()

  const handleSubmit = async (values: {
    username: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        {
          name: 'confirmPassword',
          errors: ['Passwords do not match!'],
        },
      ])
      return
    }

    const result = await register({
      username: values.username,
      email: values.email,
      password: values.password,
    })

    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <Form
      form={form}
      name="register"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: 'Please input your username!' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Username"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please enter a valid email!' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please input your password!' },
          { min: 8, message: 'Password must be at least 8 characters!' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        rules={[
          { required: true, message: 'Please confirm your password!' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm Password"
          size="large"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block size="large">
          Register
        </Button>
      </Form.Item>

      <Space style={{ width: '100%', justifyContent: 'center' }}>
        <span>Already have an account?</span>
        <Link to="/login">Login</Link>
      </Space>
    </Form>
  )
}

