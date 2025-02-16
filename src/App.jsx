import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';
import Next7Days from './pages/Next7Days';
import AllTasks from './pages/AllTasks';
import Personal from './pages/Personal';
import Work from './pages/Work';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[312px] p-4 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Navigate to="/my-day" replace />} />
            <Route path="/my-day" element={<MyDay />} />
            <Route path="/next7days" element={<Next7Days />} />
            <Route path="/alltasks" element={<AllTasks />} />
            <Route path="/personal" element={<Personal />} />
            <Route path="/work" element={<Work />} />
            {/* Add other routes as needed */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
