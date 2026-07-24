---
name: copywriter
description: Rewrite user-facing copy on models.wtf in the patient-teacher ELI5 voice and enforce the writing-style bans. Use when writing or editing any prose, titles, meta descriptions, UI strings, or learn content, or when asked to review copy for style.
---

# Copywriter

Rewrite corporate or AI-heavy prose as warm, clear explanations in the voice of a patient teacher speaking to a bright 10-year-old.

The canonical style rules live in `.agents/rules/writing-style.md`. Read that file first and apply it. This skill adds the rewrite workflow and scope.

## Summary of the rules

- Concrete, specific, short sentences. One warm reader. Every word earns its place.
- Classic sentence structure: complete sentences with a subject and a verb, connectives spelled out, natural articles kept. No colon splices, appositive fragments, or chained-verb tricolons.
- Say what a thing is before what it does: "This is a model that can see loops and curves."
- In explanations, prefer "You can draw a digit and watch how..." over the bare imperative "Draw one and watch". Imperatives stay fine in step-by-step instructions and UI labels.
- No em dashes or en dashes anywhere. Split the thought or use a comma.
- No negation-contrast framing in either direction: "X, not Y" and the reversed "doesn't X, it Z" / "never X; it just Z". State the intended claim directly.
- No filler intensifiers or throat-clearing rhetorical questions.
- Prefer visuals, diagrams, and animations over paragraph blocks. Flag any run of three or more paragraphs without a visual.
- Math goes through the `MathBlock` KaTeX component with a plain-text fallback.
- Page titles use the pipe separator: `Page name | Models.wtf`.

## Preserve

- Factual accuracy, caveats, meaning, and implications. Removing a negation-contrast frame is the easiest place to accidentally assert a NEW fact: restate the original claim, never substitute a different one. If the original claim looks factually wrong, flag it instead of silently "fixing" it in the rewrite.
- Dynamic template values such as `${variableName}` and `${percent}%` exactly as written.
- SEO length constraints. Preserve the original length or ask before changing it materially.
- Existing structured-data shapes and field names.
- Distinctive proper nouns and other substrings used as test anchors.

## Scope

Rewrite existing prose in place. Do not create new prose sections or change data structures.

Relevant prose currently lives in:

- `src/pages/learn/topics.ts`
- `src/pages/learn/topicProse.ts`
- `src/pages/learn/*.tsx`
- `src/data/models.ts`
- `src/data/glossary.ts`
- `src/data/faqs.ts`
- `src/data/releases.ts`
- `src/lib/routeMeta.ts`
- `src/data/benchmarks.ts`
- `src/lib/quiz.ts`
- `src/pages/Home.tsx`
- `src/pages/Quiz.tsx`
- `src/pages/Graph.tsx`
- `src/components/learn/*.tsx`

## Examples

Before: "An AI model is different (nobody writes the steps). Instead, you show it millions of examples and it figures out the patterns by itself."

After: "Nobody writes step-by-step instructions for an AI model. You show it millions of examples, and it learns the patterns on its own."

Before: "It's a direct-answer model (no step-by-step thinking phase), which keeps it fast. Fine for this kind of task."

After: "It answers directly without a thinking phase, which keeps it fast. That works well for this kind of task."

Before: "Meet Doodle-918: it sees loops and curves, the shapes that make a digit a digit. Draw one and watch parts become shapes become an answer."

After: "Meet Doodle-918. This is a model that can see loops and curves, and can interpret these into digits. You can draw a digit and watch how the different shapes become an answer."

## Workflow

1. Read `.agents/rules/writing-style.md`, then each target file completely.
2. Identify prose strings and scan them for the banned patterns.
3. Make targeted in-place edits using the available file-editing capability.
4. Run the test suite, including `src/lib/copy-style.test.ts`, after editing.
5. Report the changed files and summarize the patterns fixed.
