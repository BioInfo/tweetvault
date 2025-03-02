# TweetVault

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/BioInfo/tweetvault)](https://github.com/BioInfo/tweetvault/issues)
[![GitHub stars](https://img.shields.io/github/stars/BioInfo/tweetvault)](https://github.com/BioInfo/tweetvault/stargazers)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/BioInfo/tweetvault/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-yellow.svg)](https://buymeacoffee.com/justinhjohnson)

TweetVault is an AI-powered Twitter bookmark manager that helps users organize, search, and analyze their Twitter bookmarks. The application allows users to import their Twitter bookmarks, automatically categorize and summarize them using AI, and provides powerful search and organization tools.

## Features

- **Twitter Bookmark Import**: Import bookmarks from Twitter data exports
- **AI-Powered Organization**: Automatic summarization, tagging, and sentiment analysis
- **Powerful Search**: Full-text search across all bookmarks
- **Custom Collections**: Organize bookmarks into custom collections
- **Insights Dashboard**: Discover patterns and trends in your bookmarks
- **Dark/Light Mode**: Choose your preferred visual theme

## Technology Stack

- **Frontend**: React 18+ (Vite)
- **State Management**: React Context
- **UI Framework**: Tailwind CSS
- **Backend**: Supabase
- **Database**: PostgreSQL (managed by Supabase)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js v18+ and npm v9+
- Supabase account and project
- VS Code with recommended extensions (ESLint, Prettier, Tailwind CSS IntelliSense)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/BioInfo/tweetvault.git
   cd tweetvault
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

## Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [Product Requirements Document](./docs/prd.md)
- [Architecture Decisions](./docs/architecture-decisions.md)
- [Active Issues](./docs/active-issues.md)
- [Session Workflow](./docs/session-workflow.md)
- [Session Logs](./docs/sessions)

## AI-Assisted Development

This project uses an innovative AI-assisted development workflow with automatic context bridging between sessions. Learn more in the [Session Workflow](./docs/session-workflow.md) documentation.

## Contributing

We welcome contributions to TweetVault! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more information.

## Support

If you find TweetVault useful, consider supporting the project:

- [Buy Me a Coffee](https://buymeacoffee.com/justinhjohnson)
- Star the repository on GitHub
- Contribute to the codebase

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## About

TweetVault is developed with ❤️ by J&S Group, LLC.