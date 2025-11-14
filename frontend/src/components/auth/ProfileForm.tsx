/**
 * Profile Form Component
 */

import { Form, Input, Button, Avatar, Space, Upload } from 'antd'
import { UserOutlined, EditOutlined } from '@ant-design/icons'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import { profileUpdateSchema, type ProfileUpdateFormData } from '../../utils/validationSchemas'

export function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [form] = Form.useForm<ProfileUpdateFormData>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: ProfileUpdateFormData) => {
    // Validate with Zod
    const validationResult = profileUpdateSchema.safeParse(values)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors
      Object.keys(errors).forEach((key) => {
        form.setFields([
          {
            name: key as keyof ProfileUpdateFormData,
            errors: errors[key as keyof typeof errors],
          },
        ])
      })
      return
    }

    setLoading(true)
    const result = await updateProfile(validationResult.data)
    setLoading(false)
    if (result.success) {
      form.resetFields()
    }
  }

  return (
    <Form
      form={form}
      name="profile"
      onFinish={handleSubmit}
      layout="vertical"
      initialValues={{
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        avatar: user?.avatar || '',
      }}
    >
      <Form.Item label="Avatar" name="avatar">
        <Space>
          <Avatar
            size={64}
            icon={<UserOutlined />}
            src={user?.avatar}
            alt={user?.username}
          />
          <Upload
            name="avatar"
            listType="picture-card"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) => {
              // Handle avatar upload (for now, just set URL)
              // In production, upload to server and get URL
              if (info.file) {
                form.setFieldsValue({ avatar: info.file.name })
              }
            }}
          >
            <div>
              <EditOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Space>
      </Form.Item>

      <Form.Item label="Username">
        <Input prefix={<UserOutlined />} value={user?.username} disabled />
      </Form.Item>

      <Form.Item label="Email">
        <Input value={user?.email} disabled />
      </Form.Item>

      <Form.Item
        label="First Name"
        name="first_name"
        rules={[
          { max: 50, message: 'First name must be less than 50 characters!' },
        ]}
      >
        <Input placeholder="First Name" />
      </Form.Item>

      <Form.Item
        label="Last Name"
        name="last_name"
        rules={[
          { max: 50, message: 'Last name must be less than 50 characters!' },
        ]}
      >
        <Input placeholder="Last Name" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Update Profile
        </Button>
      </Form.Item>
    </Form>
  )
}
