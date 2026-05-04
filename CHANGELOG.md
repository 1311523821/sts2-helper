# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-05

### Added
- Husky pre-commit hook with lint-staged for automated code quality checks
- Commitlint configuration enforcing conventional commit format
- TypeScript strict mode: enabled `noUnusedLocals` and `noUnusedParameters`
- `getRecentRecords(limit, offset)` pagination method on RecordManager using IndexedDB cursor
- Record store now uses paginated queries (limit 50) for loading game records

### Changed
- Updated package.json with lint-staged configuration for ts/tsx/css/json/md files
- Record store replaced `getAllRecords()` with `getRecentRecords()` for better performance
- Cleaned up unused imports and variables across the codebase

### Fixed
- All TypeScript unused variable/locals errors resolved for strict mode compliance
- Removed unused `emptyRelics` and redundant type imports from test files
- Fixed unused `errors` parameter in several saveParser methods
- Removed unused `owned` variable in archetype engine combo detection

## [0.3.0] - 2026-05-04

### Added
- CI/CD pipeline with GitHub Actions (lint, test, data validation, build, security audit)
- Data reference validation script for card/archetype/combo integrity checks
- Automated data validation on PRs modifying `src/data/`
- Prettier configuration for consistent code formatting
- Vitest test framework integration
- tsx for TypeScript script execution

### Changed
- Version corrected from 1.0.0 to 0.3.0 to reflect development phase
- Unified package manager to pnpm (removed package-lock.json)
- Enhanced package.json scripts with test, validate, and format commands

### Fixed
- Removed duplicate lockfile (package-lock.json alongside pnpm-lock.yaml)