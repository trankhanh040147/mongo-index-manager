import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Menu, Sun, Moon, Monitor } from 'lucide-react'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const { theme, setTheme } = useUIStore()
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={cycleTheme}
          title={`Current theme: ${theme}`}
        >
          {getThemeIcon()}
        </Button>

        {user && (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <div className="font-medium">{user.username}</div>
              <div className="text-muted-foreground">{user.email}</div>
            </div>
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.username}
                className="h-8 w-8 rounded-full"
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}