import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <Routes>
          {/* Redirect root path to /my-day */}
          <Route path="/" element={<Navigate to="/my-day" replace />} />
          <Route path="/my-day" element={<MyDay />} />
          {/* Add other routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
