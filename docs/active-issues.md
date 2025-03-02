# Active Issues

This document tracks active issues, tasks, and bugs in the TweetVault project. It serves as a lightweight issue tracking system that can be updated during development sessions.

## Issue Format

```markdown
### [ISSUE-000] Issue Title

**Type**: [Feature | Bug | Improvement | Technical Debt]
**Status**: [Open | In Progress | Resolved | Deferred]
**Priority**: [High | Medium | Low]
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD
**Related Session**: [Link to session log if applicable]

#### Description
[Detailed description of the issue]

#### Acceptance Criteria
- [Criterion 1]
- [Criterion 2]
- ...

#### Notes
[Additional notes, context, or implementation details]
```

## Current Issues

### [ISSUE-001] Implement Authentication Flow

**Type**: Feature
**Status**: Open
**Priority**: High
**Created**: 2025-03-02
**Updated**: 2025-03-02
**Related Session**: [Initial Project Setup](./sessions/2025-03-02-initial-project-setup.md)

#### Description
Implement user authentication using Supabase Auth with email/password and Google OAuth providers. Create the necessary UI components and integration with the backend.

#### Acceptance Criteria
- User can sign up with email and password
- User can log in with email and password
- User can authenticate with Google OAuth
- User session persists across page reloads
- User can log out
- Protected routes redirect unauthenticated users to login

#### Notes
- Use Supabase Auth hooks for React
- Implement a context provider for auth state
- Create reusable form components for login and signup

### [ISSUE-002] Create Basic Layout Components

**Type**: Feature
**Status**: Open
**Priority**: High
**Created**: 2025-03-02
**Updated**: 2025-03-02
**Related Session**: [Initial Project Setup](./sessions/2025-03-02-initial-project-setup.md)

#### Description
Create the basic layout components for the application, including header, navigation, and main content area. Implement responsive design using Tailwind CSS.

#### Acceptance Criteria
- Header with logo and user menu
- Navigation sidebar with links to main sections
- Main content area with appropriate padding and layout
- Responsive design that works on mobile, tablet, and desktop
- Support for future dark/light theme implementation

#### Notes
- Use Tailwind CSS for styling
- Create modular components that can be reused
- Implement responsive breakpoints following Tailwind conventions

### [ISSUE-003] Set Up Routing with React Router

**Type**: Feature
**Status**: Open
**Priority**: High
**Created**: 2025-03-02
**Updated**: 2025-03-02
**Related Session**: [Initial Project Setup](./sessions/2025-03-02-initial-project-setup.md)

#### Description
Set up client-side routing using React Router. Define routes for all main sections of the application and implement protected routes for authenticated users.

#### Acceptance Criteria
- Define routes for home, collections, search, insights, and settings
- Implement protected route wrapper for authenticated routes
- Handle 404 pages gracefully
- Preserve route state during navigation
- Support for route parameters for dynamic pages

#### Notes
- Use React Router v6+
- Implement lazy loading for route components
- Consider using route-based code splitting

### [ISSUE-004] Implement User Settings Storage

**Type**: Feature
**Status**: Open
**Priority**: Medium
**Created**: 2025-03-02
**Updated**: 2025-03-02
**Related Session**: [Initial Project Setup](./sessions/2025-03-02-initial-project-setup.md)

#### Description
Implement storage and retrieval of user settings using Supabase. Create UI components for managing settings and a context provider for accessing settings throughout the application.

#### Acceptance Criteria
- User settings are stored in the database
- Settings are loaded when user logs in
- User can update settings through UI
- Settings include theme preference, default view, and other options
- Changes to settings are persisted immediately

#### Notes
- Use the user_settings table in the database
- Create a settings context provider
- Implement optimistic updates for better UX

## Resolved Issues

*No resolved issues yet.*

## Deferred Issues

*No deferred issues yet.*