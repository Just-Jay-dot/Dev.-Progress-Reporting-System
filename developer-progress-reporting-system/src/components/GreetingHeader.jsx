import React, { useState, useEffect } from 'react';
import './GreetingHeader.css';

function GreetingHeader() {
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      if (hours >= 12 && hours < 17) {
        setGreeting('Good afternoon');
      } else if (hours >= 17) {
        setGreeting('Good evening');
      } else {
        setGreeting('Good morning');
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="greeting-header">
      <video 
        className="greeting-background-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/goodmorninganimation.mp4" type="video/mp4" />
      </video>
      <img src="/logo.png" alt="flurr logo" className="app-logo-img" />
      <div className="greeting-content">
        <div className="app-info">
          <div className="app-name">
            flurr<span className="app-name-dot">.</span>
          </div>
          <div className="app-description">Professional 3D Rigging & Animation Platform</div>
        </div>
        <div className="greeting-right">
          <div className="greeting-text">
            {greeting}, <span className="greeting-sir">Sir!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GreetingHeader;

