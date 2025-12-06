# Project Blueprint - RigForge Studio

**Last Updated**: 2024-12-06  
**Version**: 1.0.0  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Feature Specifications](#feature-specifications)
4. [Technical Design](#technical-design)
5. [Future Planning](#future-planning)

---

## 🎯 Project Overview

### Vision

RigForge Studio is a professional web-based 3D character rigging and animation platform that provides industry-grade tools for creating, rigging, and animating 3D characters directly in the browser. The platform combines advanced auto-rigging capabilities with a comprehensive 3D animation studio.

### Core Goals

- **Advanced Auto-Rigging**: Superior marker-based bone placement with intelligent skinning
- **Professional Animation System**: Mixamo-style parameters with advanced controls
- **3D Studio Workspace**: Timeline-based editing with camera, lighting, and audio
- **Multi-Format Export**: Engine-optimized exports for Unity, Unreal, Blender, Maya
- **Production Quality**: Performance-optimized for large models and smooth playback

### Target Users

- 3D artists and animators
- Game developers
- Content creators
- Indie developers
- Students learning 3D animation

### Application Structure

RigForge Studio consists of three integrated workspaces:

1. **Rigging Workspace** (Main Tab)
   - Model loading and management
   - Marker-based auto-rigging
   - Animation library and playback
   - Export functionality

2. **3D Studio Workspace** (Studio Tab)
   - Timeline-based animation editing
   - Camera keyframing and controls
   - Lighting system
   - Audio integration
   - Frame export and rendering

3. **Library Workspace** (Library Tab)
   - 3D model browser with thumbnail previews
   - Animation browser per model
   - Full 3D preview space with maximum quality settings
   - Real-time lighting and shadows
   - Optimized for maximum performance

---

## 🏗️ Architecture

### Tech Stack

#### Frontend

- **React 19.2.0** - UI framework
- **Three.js 0.181.2** - 3D rendering engine
- **React Three Fiber 9.4.2** - React renderer for Three.js
- **@react-three/drei 10.7.7** - Three.js helpers and abstractions
- **Zustand 5.0.9** - State management
- **Vite 7.2.4** - Build tool and dev server

#### State Management

- **Zustand Stores**:
  - `modelStore.js` - Model loading and management
  - `riggingStore.js` - Rigging state and operations
  - `animationStore.js` - Animation playback and parameters
  - `viewerStore.js` - Camera and view controls
  - `studioStore.js` - 3D Studio workspace state
  - `libraryStore.js` - Library workspace state
  - `toastStore.js` - Notification system

### Project Structure

```
src/
├── components/
│   ├── animation/      # Animation library and controls
│   ├── common/         # Shared components (ErrorBoundary, Toast, etc.)
│   ├── export/         # Export dialog and utilities
│   ├── rigging/        # Marker placement and auto-rigging
│   ├── studio/         # 3D Studio workspace components
│   ├── ui/             # UI components (Sidebar, etc.)
│   └── viewer/         # 3D viewer and camera controls
├── store/              # Zustand state stores
├── utils/
│   ├── animation/      # Animation utilities
│   ├── export/         # Export utilities
│   ├── performance/    # Performance optimizations
│   ├── rigging/        # Rigging algorithms
│   ├── testing/        # Testing utilities
│   └── three/          # Three.js utilities
└── hooks/              # React hooks
```

### Design Principles

1. **Modular Architecture**: Components are self-contained and reusable
2. **State Management**: Centralized state with Zustand stores
3. **Performance First**: Optimizations for large models and smooth playback
4. **User Experience**: Intuitive UI with helpful feedback
5. **Accessibility**: Full keyboard navigation and screen reader support
6. **Responsive Design**: Works on desktop, tablet, and mobile
7. **Dual Workspace**: Seamless integration between Rigging and Studio

---

## 🎨 Feature Specifications

### Rigging Workspace Features

#### 1. Model Loading System

- **Formats Supported**: OBJ, FBX, GLTF, GLB
- **Features**:
  - Automatic centering and scaling
  - Material preservation
  - Error handling and validation
  - Progress indicators
  - Scale preservation during rigging

#### 2. Advanced Auto-Rigging System

- **Marker Placement**:

  - 2D front view interface
  - Click-to-place markers
  - Symmetrical placement option
  - Required markers: Chin, Wrists, Elbows, Knees, Groin
  - Visual feedback and validation

- **Bone Generation**:

  - Automatic bone hierarchy creation
  - Geometric analysis for optimal placement
  - Marker-based bone positioning
  - Optimal bone orientation
  - Skeleton generation

- **Advanced Skinning**:
  - Heat diffusion bone weight algorithm
  - Exponential falloff for natural deformation
  - Influence radius optimization
  - Mesh density analysis
  - Better deformation quality than simple distance-based weighting

#### 3. Animation System

- **Animation Library**:

  - 40+ FBX animation presets
  - Search and category filtering
  - Animation preview
  - Bone mapping/retargeting
  - Mixamo bone name mapping

- **Playback Controls**:

  - Play, pause, stop
  - Timeline scrubbing
  - Speed control
  - Loop control

- **Mixamo-Style Parameters**:
  - Speed/Overdrive
  - Trim Start/End
  - Mirror (left/right swap)
  - Arm-Space (arm spread)
  - Root Motion toggle

#### 4. Export System

- **Formats**: GLTF, GLB, OBJ
- **Engine Presets**:
  - Unity (Y-up, meters)
  - Unreal Engine (Z-up, centimeters)
  - Blender (Z-up, meters)
  - Maya (Y-up, centimeters)
- **Features**:
  - Coordinate system conversion
  - Scale conversion
  - Animation export
  - Skeleton export
  - Quality optimization

### 3D Studio Workspace Features

#### 1. Timeline System

- **Multi-Layer Timeline**:

  - Animation track
  - Audio track
  - Camera keyframe track
  - Frame-accurate scrubbing
  - Zoom controls
  - Time display

- **Playback Controls**:
  - Play/Pause/Stop
  - Frame-by-frame navigation
  - Time scrubbing
  - Loop options

#### 2. Camera System

- **Manual Controls**:

  - Position (X, Y, Z)
  - Rotation controls
  - Field of View (FOV) adjustment

- **Keyframe System**:

  - Add keyframes at specific times
  - Smooth interpolation between keyframes
  - Camera animation playback

- **Lock to Object**:
  - Dynamic handheld camera effect
  - Follows animated object
  - Subtle shake for realism
  - Smooth camera movement

#### 3. Lighting System

- **Ambient Light**:

  - Intensity control
  - Color adjustment

- **Directional Light**:

  - Intensity control
  - Color adjustment
  - Position control (X, Y, Z)
  - Shadow casting

- **Point Light**:
  - Intensity control
  - Color adjustment
  - Position control (X, Y, Z)

#### 4. Audio Integration

- **Audio Loading**:
  - Support for audio files
  - Timeline synchronization
  - Loop options
  - Sync with animation

#### 5. Export & Rendering

- **Frame Export**:
  - PNG, JPG, WebP formats
  - Resolution presets (1080p, 4K)
  - Custom resolution
  - Raytrace rendering options

### Library Workspace Features

#### 1. Model Browser
- **Thumbnail Previews**: Visual model representation
- **Search & Filter**: Filter by name and category
- **Model Selection**: Click to load in preview
- **Metadata Display**: File type and category

#### 2. 3D Preview Space
- **Shared 3D Viewer**: Reusable component across all workspaces
- **Maximum Quality**: 4096x4096 shadow maps, high DPR (up to 3x)
- **Real-time Rendering**: ACES Filmic tone mapping
- **Performance Optimized**: 70% minimum performance target
- **Camera Controls**: Full orbit controls with damping
- **Lighting**: Professional setup with real-time shadows

#### 3. Animation Browser
- **Model-Specific**: Shows animations for selected model
- **Lightweight Support**: Prefers JSON over FBX automatically
- **Search**: Filter animations by name
- **Auto-Play**: Plays animation when selected

#### 4. Animation Extraction System
- **Lightweight JSON Format**: 80-95% file size reduction
- **Automatic Preference**: System prefers JSON, falls back to FBX
- **Extraction Tools**: Browser-based and Node.js script options
- **Bone Mapping**: Automatic Mixamo to our skeleton mapping
- **Format**: Contains only animation data (tracks, times, values)

---

## 🔧 Technical Design

### Rigging Algorithm

#### Bone Hierarchy

```
Root
├── Hips
│   ├── Spine
│   │   ├── Spine1
│   │   │   ├── Spine2
│   │   │   │   ├── Neck
│   │   │   │   │   └── Head
│   │   │   │   ├── LeftShoulder
│   │   │   │   │   └── LeftArm
│   │   │   │   │       └── LeftForeArm
│   │   │   │   │           └── LeftHand
│   │   │   │   └── RightShoulder
│   │   │   │       └── RightArm
│   │   │   │           └── RightForeArm
│   │   │   │               └── RightHand
│   │   │   └── LeftUpLeg
│   │   │       └── LeftLeg
│   │   │           └── LeftFoot
│   │   └── RightUpLeg
│   │       └── RightLeg
│   │           └── RightFoot
```

#### Bone Weight Calculation

- **Algorithm**: Heat diffusion with exponential falloff
- **Formula**: `weight = exp(-distance² / (2 * radius²))`
- **Optimization**: Influence radius based on bone length and model size
- **Benefits**: More natural weight falloff, better deformation quality

#### Bone Placement

- **Geometric Analysis**: Analyzes mesh geometry for optimal placement
- **Mesh Density Analysis**: Calculates vertex density in body regions
- **Automatic Proportions**: Calculates shoulder width, hip width automatically
- **Scale Preservation**: Maintains model scale throughout rigging process

### Animation System

#### Bone Mapping

- Mixamo bone names → Our skeleton bone names
- Automatic retargeting
- Quaternion normalization
- Rotation correction
- Bind pose reset before animation

#### Parameter Application

- **Speed**: Time scale modification
- **Trim**: Animation clip slicing
- **Mirror**: Bone name swapping (Left ↔ Right)
- **Arm-Space**: Additional rotation on arm bones
- **Root Motion**: Root bone position control

### Performance Optimizations

1. **Geometry Optimization**:

   - Vertex merging
   - Static attribute marking
   - Shadow optimization

2. **Texture Optimization**:

   - Mipmap generation
   - Format optimization

3. **Animation Optimization**:

   - Mixer optimization
   - Frame rate control
   - Efficient bone updates

4. **Rendering Optimization**:
   - Shadow map optimization (2048x2048)
   - LOD support framework
   - Efficient lighting calculations

### Quality Features

1. **Rig Validation**:

   - Bone hierarchy validation
   - Weight distribution analysis
   - Volume loss detection
   - Self-intersection detection
   - Mesh quality metrics

2. **Error Handling**:

   - Comprehensive error recovery
   - User-friendly error messages
   - Context-aware suggestions
   - Graceful degradation

3. **Logging System**:
   - Environment-aware logging
   - Performance monitoring
   - Model statistics
   - Debug utilities

---

## 🚀 Future Planning

### Phase 1: Enhanced Rigging (Planned)

- [ ] Geodesic distance for bone weights
- [ ] Better bone orientation calculation
- [ ] Improved skeleton hierarchy
- [ ] IK constraints
- [ ] Bone weight painting UI

### Phase 2: Advanced Animation (Planned)

- [ ] Animation blending
- [ ] Multiple animation layers
- [ ] Animation sequencing
- [ ] Motion capture import
- [ ] Animation curves editor

### Phase 3: Studio Enhancements (Planned)

- [ ] Video export
- [ ] Advanced rendering options
- [ ] Post-processing effects
- [ ] Multi-camera setup
- [ ] Scene composition

### Phase 4: Collaboration (Planned)

- [ ] Cloud save/load
- [ ] Project sharing
- [ ] Version control
- [ ] Team collaboration
- [ ] Asset library

### Phase 5: Additional Features (Planned)

- [ ] Physics simulation
- [ ] Cloth simulation
- [ ] Facial animation
- [ ] Lip sync
- [ ] Procedural animation

---

## 📝 Design Decisions

### Why Zustand?

- Lightweight and performant
- Simple API
- No boilerplate
- Perfect for React
- Excellent TypeScript support

### Why React Three Fiber?

- Declarative 3D scene management
- React component model for 3D
- Excellent performance
- Active community
- Great developer experience

### Why Vite?

- Fast dev server
- Optimized builds
- Modern tooling
- Great DX
- Excellent code splitting

### Why Dual Workspace?

- Separation of concerns
- Focused workflows
- Better organization
- Scalable architecture
- Professional tool structure

---

## 🔒 Constraints & Requirements

### Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- WebGL2 required

### Performance Targets

- 60fps animation playback
- Models up to 1M+ vertices
- Fast loading times
- Efficient memory usage
- Smooth camera transitions

### Accessibility Requirements

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- WCAG 2.1 Level AA compliance (where applicable)

### Quality Standards

- Production-ready code
- Comprehensive error handling
- Performance optimizations
- Code quality and documentation
- Testing utilities

---

## 🎯 Key Technical Insights

### From Development Experience

1. **Scale Preservation**: Critical to maintain model scale throughout rigging process
2. **Bone UUIDs**: Animation tracks must use bone UUIDs, not names
3. **Bind Pose Reset**: Always reset bones to bind pose before applying animations
4. **Quaternion Normalization**: Essential for correct animation playback
5. **Shadow Quality**: 2048x2048 shadow maps provide good quality/performance balance
6. **Heat Diffusion**: Superior to simple distance-based bone weights
7. **Geometric Analysis**: Mesh density analysis improves bone placement accuracy
8. **Bind Matrix Calculation**: Must account for mesh scale in bind matrices
9. **Skeleton Cloning**: Required for proper export with joint arrays
10. **Environment-Aware Logging**: Production builds should suppress debug logs

### Best Practices

1. **Always validate**: Check bone hierarchy and weights before export
2. **Error recovery**: Provide actionable error messages with context
3. **Performance**: Optimize for large models from the start
4. **User feedback**: Clear progress indicators and notifications
5. **Code organization**: Modular, maintainable structure
6. **Testing**: Comprehensive testing checklist for all features
7. **Documentation**: Keep API documentation updated
8. **Troubleshooting**: Maintain common issues and solutions guide

### Common Issues & Solutions

#### Model Loading

- **Issue**: Model not appearing → Check console, verify file format, check scale
- **Issue**: Unsupported format → Verify extension matches actual file type
- **Issue**: Model too large/small → Auto-scaling handles this, use camera reset if needed

#### Rigging

- **Issue**: Missing markers → Ensure all required markers are placed
- **Issue**: Rigging fails → Check model geometry, verify markers on surface
- **Issue**: Scale changes → Fixed with proper bind matrix calculation

#### Animation

- **Issue**: Animation not playing → Verify model is rigged, check bone mapping
- **Issue**: Incorrect rotations → Quaternion normalization fixes this
- **Issue**: Animation offset → Bind pose reset before animation application

#### Export

- **Issue**: Joints array null → Skeleton cloning required
- **Issue**: Empty animations → Ensure animation clips passed to exporter
- **Issue**: Large bind matrices → Proper scale calculation in bind matrices

---

**This is the SINGLE SOURCE OF TRUTH for all project planning. Always update this file, never create new planning files.**
