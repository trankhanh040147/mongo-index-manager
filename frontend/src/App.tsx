import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <main className="p-8">
          <h1 className="text-3xl font-bold">Mongo Index Manager</h1>
          <p className="text-muted-foreground">Project setup complete. Next steps: build the main layout and authentication.</p>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </main>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
