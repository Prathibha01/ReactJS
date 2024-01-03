//App.js
import React from 'react';
import ExecutionDashboard from './ExecutionDashboard';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Home from './Home';
import About from './About';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Sidebar />

        <div className="content">
        <div className="App">
      <ExecutionDashboard />
    </div>
    <Routes>
            {/* Add routes for Home and About pages */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            {/* Add more routes for additional pages */}
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>

    // <div className="App">
    //   <ExecutionDashboard />
    // </div>
    
  );
}

export default App;
