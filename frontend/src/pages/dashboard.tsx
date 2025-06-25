import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDatabases } from '@/hooks/databases/use-databases'
import { Database, Server, Activity, Users } from 'lucide-react'

export function DashboardPage() {
  const { data: databasesData, isLoading } = useDatabases({ limit: 5 })

  const stats = [
    {
      title: 'Total Databases',
      value: databasesData?.extra?.total || 0,
      icon: Database,
      description: 'Connected databases',
    },
    {
      title: 'Active Connections',
      value: databasesData?.data?.length || 0,
      icon: Server,
      description: 'Currently active',
    },
    {
      title: 'Total Indexes',
      value: '0', // This would need to be calculated from all databases
      icon: Activity,
      description: 'Across all databases',
    },
    {
      title: 'Collections',
      value: '0', // This would need to be calculated
      icon: Users,
      description: 'Total collections',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your database management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Databases */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Databases</CardTitle>
          <CardDescription>
            Your most recently accessed databases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : databasesData?.data?.length ? (
            <div className="space-y-4">
              {databasesData.data.map((database) => (
                <div
                  key={database.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{database.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {database.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {database.dbName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No databases found. Create your first database to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}