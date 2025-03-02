# TweetVault Documentation

## Overview

This directory contains documentation for the TweetVault project, an AI-powered Twitter bookmark manager. The documentation is structured to support AI-assisted development with a focus on maximizing context retention between sessions while minimizing documentation overhead.

## Documentation Structure

| File/Directory | Purpose |
|----------------|---------|
| [`/sessions/`](./sessions/) | Contains chronological development session logs |
| [`/sessions/README.md`](./sessions/README.md) | Explains the session log format and best practices |
| [`architecture-decisions.md`](./architecture-decisions.md) | Records key technical decisions with context and rationale |
| [`active-issues.md`](./active-issues.md) | Tracks current issues, tasks, and bugs |
| [`session-workflow.md`](./session-workflow.md) | Defines the AI-assisted development workflow |
| [`prd.md`](./prd.md) | Product Requirements Document |
| [`functional-prd.md`](./functional-prd.md) | Functional requirements and user-facing features |

## AI-Assisted Development Workflow

TweetVault uses an AI-assisted development workflow designed to maximize productivity and knowledge retention:

1. **Session-Based Development**: Development is organized into discrete sessions, each with specific goals
2. **Progressive Context Building**: Each session builds on the context from previous sessions
3. **Self-Updating Context Bridge**: AI automatically maintains context between sessions
4. **Just-in-Time Documentation**: Decisions and progress are documented when they occur

### Workflow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Session Start  │     │  Development    │     │  Session End    │
│                 │     │                 │     │                 │
│  - Load context │     │  - Implement    │     │  - Summarize    │
│  - Set goals    │ ──> │  - Make decisions ──> │  - Document     │
│  - Plan approach│     │  - Solve problems│     │  - Update context│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                                               │
        │                                               │
        └───────────────────────────────────────────────┘
                      Context Bridge
```

## Documentation Principles

The documentation follows these core principles:

### 1. Progressive Context Building

Each session builds on the context from previous sessions, creating a continuous chain of development knowledge. This approach ensures that:

- Context evolves with the project
- Knowledge is preserved across sessions
- New sessions start with relevant background information

### 2. Single Source of Truth

Information is stored in a single location to avoid duplication and inconsistency:

- Product requirements in PRD
- Technical decisions in architecture-decisions.md
- Active tasks in active-issues.md
- Session-specific details in session logs

### 3. Embedded Status Updates

Progress is tracked within session logs rather than in separate status reports:

- Each session log includes milestone updates
- Progress is visible in the context of development work
- Historical progress can be traced through session logs

### 4. Just-in-Time Documentation

Documentation is created when decisions are made, not as a separate activity:

- Technical decisions are documented when they occur
- Implementation details are captured during development
- Context is updated at the end of each session

## Using This Documentation

### For Developers

1. Start by reading the PRD to understand the project requirements
2. Review architecture-decisions.md to understand key technical decisions
3. Check active-issues.md for current tasks and priorities
4. Read recent session logs to understand current context
5. Use session-workflow.md templates for AI-assisted development

### For Project Managers

1. Review milestone progress in session logs
2. Check active-issues.md for current status
3. Use architecture-decisions.md to understand technical direction
4. Follow session logs to track development progress

### For New Team Members

1. Start with the PRD to understand the project goals
2. Review architecture-decisions.md to understand the technical foundation
3. Read session logs chronologically to understand the project evolution
4. Check active-issues.md to see current priorities

## Maintaining Documentation

- Create a new session log for each significant development session
- Update architecture-decisions.md when making important technical decisions
- Keep active-issues.md current by adding new issues and updating status
- Follow the templates in session-workflow.md for consistency