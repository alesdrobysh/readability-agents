# Security policy

## Supported versions

Only the latest release receives security fixes.

## Report a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do
not open a public issue for an undisclosed vulnerability.

Include the affected version, reproduction steps, impact, and any suggested
fix. You should receive an acknowledgement within seven days.

## Security model

Readability processes text locally. The analyzer makes no network requests,
does not persist text, starts no listener, and requires no credentials. The host
may retain conversation and tool data under its own policy. The Claude Desktop MCP
Bundle runs a Node.js MCP server over stdio and includes the production
dependencies declared in `mcpb/server/package-lock.json`.
