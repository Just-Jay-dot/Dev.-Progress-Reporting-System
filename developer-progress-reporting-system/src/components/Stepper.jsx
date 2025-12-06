import React, { useState } from 'react';
import ProgressRing from './ProgressRing';
import './Stepper.css';

function Stepper({ phases, overallCompletion }) {
  const [expandedPhases, setExpandedPhases] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);
  const [showMaximizeButton, setShowMaximizeButton] = useState(false);
  
  const completed = phases.filter(p => p.status === 'Complete');
  const inProgress = phases.filter(p => p.status === 'In Progress');
  const pending = phases.filter(p => p.status === 'Pending');
  const allPhases = [...completed, ...inProgress, ...pending];

  const toggleExpand = (index) => {
    setExpandedPhases(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getPhaseBullets = (phaseName) => {
    // Extract bullet points from PROGRESS.md based on phase name
    const bulletMap = {
      'Phase 1: Core Rigging & Animation': [
        'Model loading (OBJ, FBX, GLTF, GLB)',
        'Marker placement system (2D front view)',
        'Advanced auto-rigging engine',
        'Bone hierarchy generation',
        'Heat diffusion skinning algorithm'
      ],
      'Phase 2: Advanced Animation Parameters': [
        'Animation library with 40+ presets',
        'FBX animation loading',
        'Bone mapping/retargeting',
        'Animation playback controls',
        'Mixamo-style parameters'
      ],
      'Phase 3: UI/UX Improvements': [
        'Modern gradient-based design',
        'Camera controls with view presets',
        'Trackpad support (macOS)',
        'Keyboard shortcuts',
        'Help panel'
      ],
      'Phase 4: Export & Quality': [
        'Multiple formats (GLTF, GLB, OBJ)',
        'Engine presets (Unity, Unreal, Blender, Maya)',
        'Coordinate system conversion',
        'Scale conversion',
        'Animation export'
      ],
      'Phase 5: 3D Studio Integration': [
        'Multi-layer timeline',
        'Animation track',
        'Audio track with synchronization',
        'Camera keyframe track',
        'Frame-accurate scrubbing'
      ],
      'Phase 6: Documentation & Organization': [
        'Project documentation structure',
        'Workflow constitution',
        'Consolidated planning (BLUEPRINT.md)',
        'Consolidated progress (PROGRESS.md)',
        'Temporary docs folder system'
      ],
      'Phase 7: Rebranding & Streamlining': [
        'Professional name',
        'Streamlined structure',
        'Updated references',
        'Integrated insights'
      ],
      'Phase 8: Library Workspace': [
        'Created Library workspace with 3-panel layout',
        'Implemented shared 3D viewer component',
        'Added bottom tab navigation',
        'Model browser with thumbnail previews',
        'Animation browser with lightweight JSON support'
      ],
      'Phase 9: Animation Extraction System': [
        'Animation extraction system (FBX to lightweight JSON)',
        'Automatic JSON preference with FBX fallback',
        'Storage organization (3D Models, Animations, Music, SFX)',
        'Created .cursorrules file to enforce documentation workflow'
      ]
    };
    return bulletMap[phaseName] || [];
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const renderPhase = (phase, index, isModal = false) => {
    let dotClass = 'pending';
    if (phase.percentage === 100) {
      dotClass = 'complete';
    } else if (phase.percentage > 0) {
      dotClass = 'progress';
    }

    const bullets = getPhaseBullets(phase.name);
    const isExpanded = expandedPhases[index];

    return (
      <div key={index} className="stepper-item">
        <div className={`stepper-dot ${dotClass}`}></div>
        <div className="stepper-content-inner">
          <div className="stepper-main-content">
            <div className="stepper-title-text">{phase.name}</div>
            <div className="stepper-description">
              {phase.status === 'Complete' ? (
                <>
                  <i className="fa-solid fa-check" style={{ fontSize: '0.625rem', color: 'var(--success)', marginRight: '0.375rem' }}></i>
                  Completed
                </>
              ) : (
                phase.status
              )}
            </div>
            <ProgressRing percentage={phase.percentage} size={40} strokeWidth={4} />
          </div>
          {bullets.length > 0 && (
            <div className="stepper-details">
              <ul className="stepper-bullets-list">
                {bullets.slice(0, 2).map((bullet, bulletIndex) => (
                  <li key={bulletIndex}>{bullet}</li>
                ))}
                {bullets.length > 2 && (
                  <div className={`stepper-bullets-expanded ${isExpanded ? 'expanded' : ''}`}>
                    {bullets.slice(2).map((bullet, bulletIndex) => (
                      <li key={bulletIndex + 2}>{bullet}</li>
                    ))}
                  </div>
                )}
              </ul>
              {bullets.length > 2 && (
                <button 
                  className="stepper-see-more"
                  onClick={() => toggleExpand(index)}
                >
                  {isExpanded ? 'See less' : 'See more'}
                  <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={`stepper-container ${isMaximized ? 'maximized' : ''}`}
        onMouseEnter={() => setShowMaximizeButton(true)}
        onMouseLeave={() => setShowMaximizeButton(false)}
      >
        <div className="stepper-header">
          {overallCompletion !== undefined && (
            <div className="stepper-overall-completion" title="Overall Completion">
              <ProgressRing percentage={overallCompletion} size={48} strokeWidth={6} />
            </div>
          )}
          <h3 className="stepper-title">Project Phases</h3>
          <button 
            className={`stepper-maximize-button ${showMaximizeButton ? 'visible' : ''}`}
            onClick={toggleMaximize}
            title={isMaximized ? 'Minimize' : 'Maximize'}
          >
            <i className={`fa-solid ${isMaximized ? 'fa-minimize' : 'fa-maximize'}`}></i>
          </button>
        </div>
        <div className="stepper-content">
          {allPhases.map((phase, index) => renderPhase(phase, index))}
        </div>
      </div>
      {isMaximized && (
        <div className="stepper-modal-overlay" onClick={toggleMaximize}>
          <div 
            className="stepper-modal-content"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setShowMaximizeButton(true)}
            onMouseLeave={() => setShowMaximizeButton(false)}
          >
            <div className="stepper-header">
              {overallCompletion !== undefined && (
                <div className="stepper-overall-completion" title="Overall Completion">
                  <ProgressRing percentage={overallCompletion} size={64} strokeWidth={8} />
                </div>
              )}
              <h3 className="stepper-title">Project Phases</h3>
              <button 
                className="stepper-maximize-button visible"
                onClick={toggleMaximize}
                title="Minimize"
              >
                <i className="fa-solid fa-minimize"></i>
              </button>
            </div>
            <div className="stepper-content">
              {allPhases.map((phase, index) => renderPhase(phase, index, true))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Stepper;

