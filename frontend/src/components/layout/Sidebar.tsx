/**
 * Sidebar Component
 */

import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  DatabaseOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import type { MenuProps } from 'antd'

const { Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/databases',
    icon: <DatabaseOutlined />,
    label: 'Databases',
  },
  {
    key: '/indexes',
    icon: <UnorderedListOutlined />,
    label: 'Indexes',
  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <Sider
      width={200}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 64, // Header height
      }}
      theme="dark"
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  )
}

