#!/usr/bin/env node
// Prelaunch branch guard (warn-only).
//
// During the prelaunch phase, work commits and deploys straight to `main`
// (see .agents/rules/workflow.md). This script warns when a git commit or
// push happens from any branch other than `main` while the prelaunch marker
// (.agents/prelaunch) exists. It never blocks: it always exits 0.
//
// It is invoked two ways:
//   1. As a Claude Code PreToolUse(Bash) hook. The hook passes a JSON event
//      on stdin; we read tool_input.command and only warn for git commit/push.
//   2. Standalone: `node scripts/guard-prelaunch-branch.mjs [command...]`.
//      Any command passed as argv is treated the same way. With no argv and
//      no stdin, it assumes a commit/push context and warns if off-main.
//
// Keeping the logic here (not in a Claude-only hook body) lets any agent,
// git hook, or CI step reuse it.

import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const marker = join(repoRoot, '.agents', 'prelaunch')

function readStdin() {
  try {
    return execFileSync('cat', [], { stdio: ['inherit', 'pipe', 'ignore'] }).toString()
  } catch {
    return ''
  }
}

// Resolve the git command text from argv or the hook's stdin JSON.
function resolveCommand() {
  const argvCommand = process.argv.slice(2).join(' ').trim()
  if (argvCommand) return argvCommand

  if (process.stdin.isTTY) return ''
  const raw = readStdin().trim()
  if (!raw) return ''
  try {
    const event = JSON.parse(raw)
    return event?.tool_input?.command ?? ''
  } catch {
    // Not JSON (e.g. piped plain text). Treat the raw text as the command.
    return raw
  }
}

const command = resolveCommand()

// Only care about git commit / git push. If we received an explicit command
// and it is neither, stay silent. If we received nothing at all, err toward
// warning (standalone invocation in a commit context).
if (command) {
  const isCommit = /\bgit\b[^\n]*\bcommit\b/.test(command)
  const isPush = /\bgit\b[^\n]*\bpush\b/.test(command)
  if (!isCommit && !isPush) process.exit(0)
}

if (!existsSync(marker)) process.exit(0)

let branch = ''
try {
  branch = execFileSync('git', ['branch', '--show-current'], {
    cwd: repoRoot,
  })
    .toString()
    .trim()
} catch {
  process.exit(0) // Not a git context we can read; do not warn spuriously.
}

// Detached HEAD reports empty; nothing useful to say.
if (!branch || branch === 'main') process.exit(0)

const message = [
  '',
  '  PRELAUNCH WORKFLOW WARNING',
  `  Current branch is "${branch}", not "main".`,
  '  During prelaunch, commit and push straight to main. No feature branches,',
  '  no PRs, unless Sean says otherwise (see .agents/rules/workflow.md).',
  '  Delete .agents/prelaunch to end prelaunch and silence this warning.',
  '',
].join('\n')

// Write to stderr so it surfaces in tool output without being mistaken for
// command stdout. Warn-only: exit 0 so nothing is blocked.
process.stderr.write(`${message}\n`)
process.exit(0)
