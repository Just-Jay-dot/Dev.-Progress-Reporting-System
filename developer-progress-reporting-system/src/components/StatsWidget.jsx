import React, { useState, useEffect } from 'react';
import ProgressRing from './ProgressRing';
import './StatsWidget.css';

function StatsWidget({ data }) {
  const [time, setTime] = useState(new Date());
  const [colonVisible, setColonVisible] = useState(true);
  
  const { overallCompletion, phases } = data;
  const completedPhases = phases.filter(p => p.status === 'Complete').length;

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date());
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    const colonInterval = setInterval(() => {
      setColonVisible(prev => !prev);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(colonInterval);
    };
  }, []);

  const formatTime = (date) => {
    const hours12 = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return { hours12, minutes, ampm };
  };

  const timeData = formatTime(time);

  return (
    <div className="overview-stats-widget">
      <div className="stats-item">
        <div className="stats-icon">
          <i className="fa-solid fa-layer-group"></i>
        </div>
        <div className="stats-content">
          <div className="stats-label">Total Phases</div>
          <div className="stats-value">{phases.length}</div>
        </div>
      </div>

      <div className="stats-item">
        <div className="stats-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <div className="stats-content">
          <div className="stats-label">Completed</div>
          <div className="stats-value">{completedPhases}</div>
        </div>
      </div>

      <div className="stats-item stats-time">
        <div className="stats-icon">
          <i className="fa-regular fa-clock"></i>
        </div>
        <div className="stats-content">
          <div className="stats-label">Current Time</div>
          <div className="current-time">
            <span className="time-hours">{timeData.hours12}</span>
            <span className="time-colon">{colonVisible ? ':' : ' '}</span>
            <span className="time-minutes">{timeData.minutes}</span>
            <span className="time-ampm">{timeData.ampm}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsWidget;

