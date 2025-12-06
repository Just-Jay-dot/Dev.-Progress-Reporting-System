import React, { useEffect, useRef } from 'react';
import './ProgressRing.css';

function ProgressRing({ percentage, size = 64, strokeWidth = 8 }) {
  const circleRef = useRef(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (circleRef.current) {
      const offset = circumference - (percentage / 100) * circumference;
      circleRef.current.style.strokeDasharray = `${circumference} ${circumference}`;
      circleRef.current.style.strokeDashoffset = offset;
      
      // Color coding
      circleRef.current.classList.remove('success', 'warning');
      if (percentage === 100) {
        circleRef.current.classList.add('success');
      } else if (percentage > 0) {
        circleRef.current.classList.add('warning');
      }
    }
  }, [percentage, circumference]);

  const fontSize = size <= 40 ? '0.5rem' : size <= 48 ? '0.625rem' : '0.75rem';

  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          className="progress-ring-circle progress-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          className="progress-ring-circle progress-ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
      </svg>
      <div className="progress-ring-text" style={{ fontSize }}>
        {percentage}%
      </div>
    </div>
  );
}

export default ProgressRing;

