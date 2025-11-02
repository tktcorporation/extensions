# App Search Changelog

## [Initial Release] - 2025-11-01

### Core Features

- **AI-Powered Search** - Natural language search for applications using Claude AI
- **Smart Fuzzy Matching** - Find apps with partial names or acronyms (e.g., "vsc" → Visual Studio Code)
- **Purpose-Based Search** - Search by intent (e.g., "email app", "browser", "code editor")
- **Multilingual Support** - Full internationalization with English and Japanese translations
- **Ask AI Feature** - Manual AI trigger for short queries (≤3 characters) and automatic fallback for zero results
- **Instant Launch** - Press Enter to open applications immediately

### Technical Highlights

- Type-safe i18n system with language selection via preferences
- Comprehensive test coverage (40 unit tests)
- Strict TypeScript configuration with ESLint rules
- Clean code architecture with separated components and utilities
- AI-powered query interpretation with category matching
- Smart scoring system that merges fuzzy matching and AI recommendations
- Race condition prevention with search ID tracking

### Store Submission

- Ready for Raycast Store submission
- 3 high-quality screenshots demonstrating key features
- Comprehensive documentation (README, i18n guide)
- All code quality checks passing (lint, tests, build)
- Follows Raycast naming conventions and best practices
