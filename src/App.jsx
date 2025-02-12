import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MyDay from './pages/MyDay';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MyDay />
    </div>
  );
}

export default App;
