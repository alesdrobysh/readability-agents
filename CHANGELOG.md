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

## [0.2.0] - 2026-11-12

- Hardened Markdown cleanup and sentence boundaries for headings, tables,
  abbreviations, initials, decimals, quotes, and multiline prose.
- Added short-sample warnings, a bundled local difficult-word shortlist,
  project vocabulary allowlists, and sentence-level complexity hints.
- Added multi-file CLI reports in JSON and Markdown, with threshold exits for CI.
- Added a public-domain benchmark corpus and deterministic regression checks.
- Updated the skill and MCP tool to expose the new findings.
- Reader validation for 1.0 remains open; heuristic hints should not be treated
  as a calibrated assessment of reader comprehension.

## [0.1.0] - 2026-07-30

### Added

- Local English readability analyzer with Flesch Reading Ease, MTLD, TTR, and
  surface statistics.
- Claude Code plugin and self-hosted plugin marketplace.
- Claude Desktop MCP Bundle.
- CLI threshold checks, smoke tests, CI, and release automation.

[Unreleased]: https://github.com/alesdrobysh/readability-agents/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/alesdrobysh/readability-agents/releases/tag/v0.2.0
[0.1.0]: https://github.com/alesdrobysh/readability-agents/releases/tag/v0.1.0
