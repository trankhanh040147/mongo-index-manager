import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDatabases } from '@/hooks/databases/use-databases'
import { Plus, Search, Database, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export function DatabasesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 10

  const { data, isLoading, error } = useDatabases({
    query: search,
    page,
    limit,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Databases</h1>
          <p className="text-muted-foreground">
            Manage your database connections and configurations
          </p>
        </div>
        <Button asChild>
          <Link to="/databases/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Database
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search databases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Database List */}
      {isLoading ? (
        <div className="text-center py-8">Loading databases...</div>
      ) : error ? (
        <div className="text-center py-8 text-destructive">
          Error loading databases: {error.error}
        </div>
      ) : data?.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((database) => (
            <Card key={database.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Database className="h-5 w-5 text-primary" />
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/databases/${database.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <CardTitle className="text-lg">{database.name}</CardTitle>
                <CardDescription>
                  {database.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Database:</span> {database.dbName}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {formatDate(database.createdAt)}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span>{' '}
                    {formatDate(database.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No databases found</h3>
            <p className="text-muted-foreground mb-4">
              {search
                ? 'No databases match your search criteria.'
                : 'Get started by creating your first database connection.'}
            </p>
            <Button asChild>
              <Link to="/databases/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Database
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data?.extra && data.extra.total > limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to{' '}
            {Math.min(page * limit, data.extra.total)} of {data.extra.total} databases
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= data.extra.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}