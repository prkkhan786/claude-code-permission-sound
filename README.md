# claude-code-permission-sound 🔔

> Plays a sound whenever Claude Code asks for your permission

## Install

\`\`\`bash
npx claude-code-permission-sound install
\`\`\`

Works on macOS and Linux. No dependencies.

## Uninstall

\`\`\`bash
npx claude-code-permission-sound uninstall
\`\`\`

## How it works

Uses [Claude Code hooks](https://code.claude.com/docs/en/hooks) — specifically the
`PermissionRequest` event — to run a small shell script that plays your system's
notification sound whenever Claude needs your approval.