import React, { useState, useEffect } from 'react';
import GreetingHeader from './GreetingHeader';
import StatsWidget from './StatsWidget';
import Stepper from './Stepper';
import ServerStatus from './ServerStatus';
import { parseProgress } from '../utils/markdownParser';
import { connectWebSocket } from '../utils/api';
import './Overview.css';

function Overview({ onNavigateToDNS }) {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/PROGRESS.md');
      if (!response.ok) throw new Error('Failed to load file');
      const markdown = await response.text();
      const data = parseProgress(markdown);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Failed to load progress data. Please check if PROGRESS.md exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
    
    // Connect WebSocket for auto-refresh
    const ws = connectWebSocket((data) => {
      if (data.type === 'file-changed' && data.file === 'PROGRESS.md') {
        loadProgress();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="content-section overview-section">
      <GreetingHeader />
      {loading ? (
        <div className="overview-loading">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading progress data...</p>
        </div>
      ) : error ? (
        <div className="overview-error">
          <i className="fa-solid fa-circle-exclamation"></i>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {progressData && <StatsWidget data={progressData} />}
          <ServerStatus onSettingsClick={onNavigateToDNS} />
          {progressData && <Stepper phases={progressData.phases} overallCompletion={progressData.overallCompletion} />}
        </>
      )}
    </div>
  );
}

export default Overview;

