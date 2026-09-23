# Contributing

Small, focused pull requests are welcome.

## Setup

```bash
npm install
npm test
npm run validate:mcpb
npm run build:mcpb
```

The analyzer targets English prose and deliberately uses a small heuristic.
Changes to scoring or tokenization need a failing fixture first. Avoid runtime
dependencies unless the benefit clearly outweighs the installation cost.

Before opening a pull request:

1. Run `npm test`.
2. Run `npm audit` in the root and `npm audit --omit=dev` in `mcpb/server`.
3. Run `npm run build:mcpb` from a clean checkout.
4. Run `npx mcpb info readability.mcpb` and inspect the packaged files.
5. Confirm `git status --short` contains only intended changes.

## Release checklist

1. Update the version in `package.json`, `plugin.json`,
   `.codex-plugin/plugin.json`, `plugin/.claude-plugin/plugin.json`,
   `mcpb/manifest.json`, and `mcpb/server/package.json`.
2. Move changelog entries from Unreleased to the release version.
3. Run all checks above.
4. Install the candidate bundle in Claude Desktop, the Claude Code plugin,
   and the portable skill in at least one other agent using the README steps.
5. Tag the commit as `vX.Y.Z` and push the tag.
6. Verify the GitHub release contains `readability.mcpb` and its SHA-256 file.
