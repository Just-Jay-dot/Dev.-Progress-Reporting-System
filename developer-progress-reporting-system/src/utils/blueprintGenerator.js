// Blueprint Generator - Creates comprehensive BLUEPRINT.md from project discussions
// This service analyzes conversation history and generates structured documentation

import { getFullProjectContext, writeDocument, readDocument } from './documentService';

/**
 * Generate a comprehensive BLUEPRINT.md from project discussion
 */
export async function generateBlueprint(projectDiscussion, existingBlueprint = '') {
  const date = new Date().toISOString().split('T')[0];
  
  // If blueprint exists, enhance it; otherwise create new
  if (existingBlueprint && existingBlueprint.length > 100) {
    return `# Project Blueprint

**Last Updated**: ${date}
**Status**: In Development

${existingBlueprint}

---

## 📝 Discussion Notes

${projectDiscussion}

---

*This blueprint was updated based on project discussion. Review and refine as needed.*
`;
  }
  
  // Generate new blueprint structure
  return `# Project Blueprint

**Created**: ${date}
**Status**: Planning Phase
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Feature Specifications](#feature-specifications)
4. [Technical Design](#technical-design)
5. [Implementation Phases](#implementation-phases)
6. [Future Planning](#future-planning)

---

## 🎯 Project Overview

### Vision
[Describe the project vision based on the discussion]

### Core Goals
- [Goal 1]
- [Goal 2]
- [Goal 3]

### Target Users
- [User type 1]
- [User type 2]

---

## 🏗️ Architecture

### System Architecture
[Describe the overall system architecture]

### Technology Stack
- **Frontend**: [To be determined]
- **Backend**: [To be determined]
- **Database**: [To be determined]
- **Other**: [To be determined]

### Key Components
- [Component 1]
- [Component 2]

---

## ✨ Feature Specifications

### Core Features
1. **Feature Name**
   - Description: [Description]
   - Priority: High/Medium/Low
   - Status: Planned

### Additional Features
[Additional features from discussion]

---

## 🔧 Technical Design

### Design Patterns
[Design patterns to be used]

### Data Models
[Data structure descriptions]

### API Design
[API endpoints and structure]

---

## 📅 Implementation Phases

### Phase 1: Foundation
- [ ] Setup project structure
- [ ] Initialize core components
- [ ] Basic functionality

### Phase 2: Core Features
- [ ] Implement main features
- [ ] Testing and refinement

### Phase 3: Enhancement
- [ ] Additional features
- [ ] Performance optimization

---

## 🔮 Future Planning

### Planned Enhancements
- [Future feature 1]
- [Future feature 2]

### Considerations
[Important considerations for future development]

---

## 📝 Project Discussion Summary

${projectDiscussion}

---

*This blueprint was generated from project discussion. Please review and refine the details.*
`;
}

/**
 * Generate initial PROGRESS.md
 */
export async function generateProgress(projectName = 'Project') {
  const date = new Date().toISOString().split('T')[0];
  
  return `# Project Progress - ${projectName}

**Last Updated**: ${date}
**Current Status**: 🟡 Planning Phase
**Overall Completion**: 0%

---

## 📊 Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Planning | 🟡 In Progress | 0% |
| Phase 2: Development | ⚪ Not Started | 0% |
| Phase 3: Testing | ⚪ Not Started | 0% |
| Phase 4: Deployment | ⚪ Not Started | 0% |

---

## ✅ Completed Features

_No features completed yet._

---

## 🚧 In Progress

- Project planning and blueprint creation
- Architecture design

---

## 📋 Planned Features

_Features will be added as development progresses._

---

## 🐛 Bug Fixes

_No bugs reported yet._

---

## 📈 Milestones

- [ ] Project initialization
- [ ] Blueprint finalized
- [ ] Development started

---

*Progress will be updated as development continues.*
`;
}

/**
 * Analyze conversation and determine if blueprint should be created/updated
 */
export async function shouldCreateBlueprint(messages) {
  // Check if user has discussed project details
  const recentMessages = messages.slice(-10);
  const conversationText = recentMessages.map(m => m.content).join(' ');
  
  // Keywords that indicate project discussion
  const projectKeywords = [
    'project', 'application', 'app', 'system', 'platform',
    'feature', 'functionality', 'build', 'create', 'develop',
    'architecture', 'design', 'blueprint', 'plan'
  ];
  
  const keywordCount = projectKeywords.filter(keyword => 
    conversationText.toLowerCase().includes(keyword)
  ).length;
  
  // If enough project-related keywords and substantial discussion
  return keywordCount >= 3 && conversationText.length > 200;
}

/**
 * Extract project information from conversation
 */
export function extractProjectInfo(messages) {
  const recentMessages = messages.slice(-10);
  const conversationText = recentMessages.map(m => m.content).join('\n');
  
  return {
    discussion: conversationText,
    messageCount: recentMessages.length,
    hasProjectDetails: conversationText.length > 100
  };
}

