// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Lead from './pages/Lead';
import Employee from './pages/Employees';
import Settings from './pages/Settings';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />        
        <Route path="/leads" element={<Lead />} />         
        <Route path="/employees" element={<Employee />} /> 
        <Route path="/settings" element={<Settings />} /> 
      </Routes>
    </Router>
  );
};

export default App;
