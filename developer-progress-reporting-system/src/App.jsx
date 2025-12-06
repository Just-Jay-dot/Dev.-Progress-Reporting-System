import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Progress from './components/Progress';
import Blueprint from './components/Blueprint';
import ActivityLog from './components/ActivityLog';
import AIChat from './components/AIChat';
import Settings from './components/Settings';
import CursorRules from './components/CursorRules';
import GitHub from './components/GitHub';
import DNSSettings from './components/DNSSettings';
import About from './components/About';
import Search from './components/Search';
import './styles/App.css';

function App() {
  const [activeSection, setActiveSection] = useState('overview');

  const handleNavigateToDNS = () => {
    setActiveSection('dns');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only trigger if not typing in input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + number keys for navigation
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const shortcuts = {
          '1': 'overview',
          '2': 'progress',
          '3': 'blueprint',
          '4': 'log',
          '5': 'ai-chat',
          '6': 'settings',
          '7': 'cursor-rules',
          '8': 'github',
          '9': 'search'
        };
        if (shortcuts[e.key]) {
          setActiveSection(shortcuts[e.key]);
        }
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveSection('search');
      }

      // Escape to go back to overview
      if (e.key === 'Escape' && activeSection !== 'overview') {
        setActiveSection('overview');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSection]);

  const sections = {
    overview: <Overview onNavigateToDNS={handleNavigateToDNS} />,
    progress: <Progress />,
    blueprint: <Blueprint />,
    log: <ActivityLog />,
    'ai-chat': <AIChat />,
    settings: <Settings />,
    'cursor-rules': <CursorRules />,
    github: <GitHub />,
    dns: <DNSSettings />,
    about: <About />,
    search: <Search />
  };

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="main-content">
        {sections[activeSection]}
      </main>
    </div>
  );
}

export default App;

