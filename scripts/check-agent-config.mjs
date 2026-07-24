import { access, readdir, readFile } from 'node:fs/promises'

const requiredAdapters = {
  'CLAUDE.md': 'AGENTS.md',
  'GEMINI.md': 'AGENTS.md',
  '.cursor/rules/project.mdc': 'AGENTS.md',
  '.github/copilot-instructions.md': 'AGENTS.md',
}

const guidanceFiles = [
  'AGENTS.md',
  'src/AGENTS.md',
  'src/data/AGENTS.md',
  'src/lib/AGENTS.md',
  'src/pages/learn/AGENTS.md',
  'scripts/AGENTS.md',
]

const failures = []

async function exists(file) {
  try {
    await access(file)
    return true
  } catch {
    return false
  }
}

for (const [adapter, canonicalSource] of Object.entries(requiredAdapters)) {
  if (!(await exists(adapter))) {
    failures.push(`Missing adapter: ${adapter}`)
    continue
  }

  const content = await readFile(adapter, 'utf8')
  if (!content.includes(canonicalSource)) {
    failures.push(`${adapter} must reference ${canonicalSource}`)
  }
}

const rootContent = await readFile('AGENTS.md', 'utf8')

for (const guidanceFile of guidanceFiles) {
  if (!(await exists(guidanceFile))) {
    failures.push(`Missing guidance file: ${guidanceFile}`)
    continue
  }

  const content = await readFile(guidanceFile, 'utf8')

  for (const [, skillName] of content.matchAll(/\.agents\/skills\/([\w-]+)(?:\/SKILL\.md)?/g)) {
    const skillFile = `.agents/skills/${skillName}/SKILL.md`
    if (!(await exists(skillFile))) {
      failures.push(`${guidanceFile} references missing skill: ${skillFile}`)
    }
  }

  for (const [, ruleName] of content.matchAll(/\.agents\/rules\/([\w-]+)\.md/g)) {
    const ruleFile = `.agents/rules/${ruleName}.md`
    if (!(await exists(ruleFile))) {
      failures.push(`${guidanceFile} references missing rule: ${ruleFile}`)
    }
  }

  // Root AGENTS.md must link every nested guidance file so the index can't go stale.
  if (guidanceFile !== 'AGENTS.md' && !rootContent.includes(guidanceFile)) {
    failures.push(`AGENTS.md must reference ${guidanceFile}`)
  }
}

// Every rule file must be indexed from the root AGENTS.md.
for (const ruleFile of await readdir('.agents/rules')) {
  if (!ruleFile.endsWith('.md')) continue
  if (!rootContent.includes(`.agents/rules/${ruleFile}`)) {
    failures.push(`AGENTS.md must index .agents/rules/${ruleFile}`)
  }
}

// Repo-wide dash ban applies to agent guidance docs too.
const dashCheckFiles = [
  ...guidanceFiles,
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  '.agents/skills/copywriter/SKILL.md',
]
for (const ruleFile of await readdir('.agents/rules')) {
  if (ruleFile.endsWith('.md')) dashCheckFiles.push(`.agents/rules/${ruleFile}`)
}
for (const file of dashCheckFiles) {
  if (!(await exists(file))) continue
  const content = await readFile(file, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, i) => {
    if (line.includes('—')) {
      failures.push(`${file}:${i + 1} contains an em dash; the repo bans them (see .agents/rules/writing-style.md)`)
    }
  })
}

if (failures.length > 0) {
  console.error('Agent configuration validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log('Agent configuration is internally consistent.')
}
