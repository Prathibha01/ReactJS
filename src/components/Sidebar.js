// Sidebar.js

import { Link } from 'react-router-dom';
//import './Sidebar.css'; // Import your styles

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
