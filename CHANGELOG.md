# Changelog

All notable changes to the Citadel Academy project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation of implemented NIPs in README
- Detailed project structure documentation
- JSDoc comments for key functions
- Implemented NIP-50 search functionality for course discovery
- Added CourseSearch component for searching courses

### Fixed
- Fixed client initialization in Redux store by properly passing client parameter to nostrMainInit
- Enhanced relay connection stability with improved error handling
- Implemented proper parameter handling in nostrMainInit function
- Added exponential backoff for relay reconnection attempts
- Improved error handling in event publishing
- Fixed URL normalization to prevent duplicate relay connections

### Changed
- Updated README with detailed installation instructions
- Added development commands to README
- Improved code documentation with JSDoc comments
- Reduced maximum reconnection attempts to prevent excessive reconnection attempts

## [1.0.0] - 2023-06-01

### Added
- Initial release of Citadel Academy
- Nostr-native authentication
- Course catalog browser
- Basic badge issuance
- Family group creation