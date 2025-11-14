/**
 * Profile Page
 */

import { Card, Typography } from 'antd'
import { ProfileForm } from '../../components/auth/ProfileForm'

const { Title } = Typography

export function ProfilePage() {
  return (
    <div>
      <Title level={2}>Profile</Title>
      <Card style={{ maxWidth: 600, marginTop: 24 }}>
        <ProfileForm />
      </Card>
    </div>
  )
}


