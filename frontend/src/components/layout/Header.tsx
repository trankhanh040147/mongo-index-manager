/**
 * Header Component
 */

import { Layout, Dropdown, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { APP_NAME } from '../../utils/constants'

const { Header: AntHeader } = Layout

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
        {APP_NAME}
      </div>
      <Space>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.username || 'User'}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  )
}

