/**
 * Register Form Component
 */

import { Form, Input, Button, Space } from 'antd'
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { registerSchema, type RegisterFormData } from '../../utils/validationSchemas'

export function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form] = Form.useForm<RegisterFormData & { confirmPassword: string }>()

  const handleSubmit = async (values: RegisterFormData & { confirmPassword: string }) => {
    // Validate with Zod
    const validationResult = registerSchema.safeParse(values)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      Object.keys(errors).forEach((key) => {
        form.setFields([
          {
            name: key as keyof RegisterFormData,
            errors: errors[key as keyof typeof errors],
          },
        ])
      })
      return
    }

    const result = await register({
      username: validationResult.data.username,
      email: validationResult.data.email,
      password: validationResult.data.password,
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
        rules={[
          { required: true, message: 'Please input your username!' },
          {
            min: 3,
            message: 'Username must be at least 3 characters!',
          },
          {
            max: 50,
            message: 'Username must be less than 50 characters!',
          },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: 'Username can only contain letters, numbers, and underscores!',
          },
        ]}
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
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error("Passwords don't match!"))
            },
          }),
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
