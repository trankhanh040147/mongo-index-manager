/**
 * Login Form Component
 */

import { Form, Input, Button, Space } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { loginSchema, type LoginFormData } from '../../utils/validationSchemas'

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [form] = Form.useForm<LoginFormData>()

  const handleSubmit = async (values: LoginFormData) => {
    // Validate with Zod
    const validationResult = loginSchema.safeParse(values)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      Object.keys(errors).forEach((key) => {
        form.setFields([
          {
            name: key as keyof LoginFormData,
            errors: errors[key as keyof typeof errors],
          },
        ])
      })
      return
    }

    const result = await login(validationResult.data)
    if (result.success) {
      // Redirect to the page user was trying to access, or dashboard
      const from = (location.state as { from?: Location })?.from
      navigate(
        from
          ? ((from as { pathname?: string }).pathname || '/dashboard')
          : '/dashboard',
        {
          replace: true,
        }
      )
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
