# Implementation Plan - Multi-Project Management & Enhanced Analysis

## Phase 1: Foundation - Project Data Layer
- [ ] **Task: Define Project Schema and Storage Logic**
    - [ ] Define `Project`, `ProductionMetadata`, and `ProjectArtifacts` interfaces in a new `types/project.ts` or within `index.tsx`.
    - [ ] Create a `ProjectStore` utility class or hooks to handle CRUD operations in LocalStorage.
    - [ ] Write unit tests for `ProjectStore` to verify data persistence and retrieval.
- [ ] **Task: Implement Project Scoping Logic**
    - [ ] Update existing state management (documents, chats, audit logs) to be scoped by a `currentProjectId`.
    - [ ] Migrate existing "flat" LocalStorage data into a default project structure to prevent data loss.
    - [ ] Write tests to ensure data from Project A is inaccessible when Project B is active.
- [ ] **Task: Conductor - User Manual Verification 'Foundation - Project Data Layer' (Protocol in workflow.md)**

## Phase 2: UI Integration - Project Management
- [ ] **Task: Create Project Dashboard View**
    - [ ] Build a `ProjectDashboard` component to list all projects in a grid/list format.
    - [ ] Implement "Create Project" modal with form validation for metadata (Union, Studio, etc.).
    - [ ] Add "Edit" and "Delete" functionality to project items.
    - [ ] Write tests for the Dashboard UI and CRUD workflows.
- [ ] **Task: Build Sidebar Project Switcher**
    - [ ] Implement a `Sidebar` component (or update existing layout) with a project dropdown or list for quick switching.
    - [ ] Add visual indicators for the "Active" project.
    - [ ] Write tests for sidebar navigation and project switching triggers.
- [ ] **Task: Conductor - User Manual Verification 'UI Integration - Project Management' (Protocol in workflow.md)**

## Phase 3: Enhanced Analysis & Viewer
- [ ] **Task: Improve PDF Viewer Navigation**
    - [ ] Refactor `DocumentViewer` to support programmatic scrolling and highlighting based on citation data.
    - [ ] Enhance UI controls for zooming and page navigation.
    - [ ] Write tests for viewer navigation logic.
- [ ] **Task: Refine Citation Mapping Logic**
    - [ ] Update AI prompt logic (if necessary) and parsing engine to produce more granular citation metadata (page numbers, section IDs).
    - [ ] Implement a "Jump to Source" feature that links citations directly to the viewer's current state.
    - [ ] Write tests for citation parsing and mapping accuracy.
- [ ] **Task: Conductor - User Manual Verification 'Enhanced Analysis & Viewer' (Protocol in workflow.md)**

## Phase 4: Refinement & Visual Polish
- [ ] **Task: Final UI/UX Audit**
    - [ ] Ensure all new project management views adhere to the "Dark OS" aesthetic.
    - [ ] Perform responsive design checks for mobile/tablet layouts.
- [ ] **Task: End-to-End Verification**
    - [ ] Execute full flow: Create 2 Projects -> Upload unique PDFs to each -> Verify Chat isolation -> Verify Citation mapping in Document Viewer.
- [ ] **Task: Conductor - User Manual Verification 'Refinement & Verification' (Protocol in workflow.md)**