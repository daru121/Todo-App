import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[312px] p-4 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/my-day" replace />} />
            <Route path="/my-day" element={<MyDay />} />
            {/* Add other routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
