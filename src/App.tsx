import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import MailApp from './components/Email/MailApp';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MailApp />;
}

export default App;
