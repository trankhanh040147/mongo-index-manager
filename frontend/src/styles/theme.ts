/**
 * Ant Design Theme Configuration
 */

import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#ffffff',
      siderBg: '#001529',
    },
    Menu: {
      darkItemBg: '#001529',
      darkSubMenuItemBg: '#000c17',
    },
    Card: {
      borderRadius: 8,
    },
    Button: {
      borderRadius: 6,
    },
    Input: {
      borderRadius: 6,
    },
  },
}

