/**
 * useMessage Hook - Wrapper for Ant Design message API
 */

import { App } from 'antd'

export function useMessage() {
  const { message } = App.useApp()
  return message
}



