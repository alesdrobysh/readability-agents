# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and
this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Portable Agent Skill for Codex, OpenCode, Pi, OMP, Hermes, and compatible
  hosts, with a self-contained Node.js module scope.
- Portable and Codex plugin manifests.

### Changed

- Made the skill instructions independent of Claude Code environment variables.
- Renamed the package and Codex plugin from `readability-claude` to
  `readability-agents` to reflect support for multiple coding agents.

## [0.1.0] - 2026-07-30

### Added

- Local English readability analyzer with Flesch Reading Ease, MTLD, TTR, and
  surface statistics.
- Claude Code plugin and self-hosted plugin marketplace.
- Claude Desktop MCP Bundle.
- CLI threshold checks, smoke tests, CI, and release automation.

[Unreleased]: https://github.com/alesdrobysh/readability-agents/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alesdrobysh/readability-agents/releases/tag/v0.1.0
