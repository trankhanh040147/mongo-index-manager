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
        <AntLayout 
          style={{ 
            marginLeft: 200, 
            marginTop: 64,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: '#fff',
              minHeight: 'calc(100vh - 112px)',
              overflow: 'initial',
            }}
          >
            <Outlet />
          </Content>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  )
}

