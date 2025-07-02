import { Navigate, Outlet } from 'react-router-dom';
    import { useAuthStore } from '@/store/authStore';

    const AppLayout = () => {
      const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }

      return (
        <div className="min-h-screen bg-gray-50">
          {/* TODO: Add Sidebar and Header */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </main>
        </div>
      );
    };

    export default AppLayout;
