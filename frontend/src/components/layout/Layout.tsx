/**
 * Main Layout Component
 */

import { Layout as AntLayout } from 'antd'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Outlet } from 'react-router-dom'

const { Content } = AntLayout

export function Layout() {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <AntLayout>
        <Sidebar />
        <AntLayout style={{ marginLeft: 200, marginTop: 64 }}>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: '#fff',
              minHeight: 280,
            }}
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  )
}

