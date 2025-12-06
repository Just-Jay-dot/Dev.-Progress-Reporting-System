import React from 'react';
import './Sidebar.css';

function Sidebar({ activeSection, setActiveSection }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <img src="/cursor-logo.png" alt="Cursor" className="sidebar-logo" />
        <div className="sidebar-header-text">
          <h1>Cursor</h1>
          <p className="sidebar-description">Dev. Progress Report System</p>
        </div>
      </div>
      
      <div className="nav-section">
        <div className="nav-section-title">Navigation</div>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('overview'); }}
          title="Overview (Ctrl+1)"
        >
          <i className="fa-solid fa-chart-line"></i>
          <span>Overview</span>
          <span className="nav-shortcut">⌘1</span>
        </a>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'progress' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('progress'); }}
        >
          <i className="fa-solid fa-tasks"></i>
          <span>Progress</span>
        </a>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'blueprint' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('blueprint'); }}
        >
          <i className="fa-solid fa-diagram-project"></i>
          <span>Blueprint</span>
        </a>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'log' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('log'); }}
        >
          <i className="fa-solid fa-list-ul"></i>
          <span>Activity Log</span>
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">AI Powered</div>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'ai-chat' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('ai-chat'); }}
        >
          <i className="fa-solid fa-comments"></i>
          <span>AI Assistant</span>
        </a>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('settings'); }}
        >
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Documentation</div>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'cursor-rules' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('cursor-rules'); }}
        >
          <i className="fa-solid fa-file-code"></i>
          <span>Cursor Rules</span>
        </a>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('search'); }}
        >
          <i className="fa-solid fa-search"></i>
          <span>Search</span>
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">GitHub</div>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'github' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('github'); }}
        >
          <i className="fa-brands fa-github"></i>
          <span>Repository</span>
        </a>
      </div>

      <div className="nav-section">
        <div className="nav-section-title">Network</div>
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'dns' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('dns'); }}
        >
          <i className="fa-solid fa-network-wired"></i>
          <span>DNS Settings</span>
        </a>
      </div>

      <div className="nav-section nav-section-bottom">
        <a 
          href="#" 
          className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); setActiveSection('about'); }}
        >
          <i className="fa-solid fa-circle-info"></i>
          <span>About</span>
        </a>
      </div>
    </nav>
  );
}

export default Sidebar;

