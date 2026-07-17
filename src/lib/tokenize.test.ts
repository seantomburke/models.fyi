import { estimateTokens, loadTokenizer } from './tokenize.ts'

test('estimateTokens approximates four characters per token', () => {
  expect(estimateTokens('')).toBe(0)
  expect(estimateTokens('abcd')).toBe(1)
  expect(estimateTokens('abcde')).toBe(2)
  expect(estimateTokens('a'.repeat(400))).toBe(100)
})

test('loadTokenizer resolves a working counter and memoizes the load', async () => {
  const first = loadTokenizer()
  expect(loadTokenizer()).toBe(first)
  const count = await first
  expect(count('hello world')).toBeGreaterThan(0)
  expect(count('')).toBe(0)
  // A real BPE count is far below the 1-token-per-character worst case.
  expect(count('hello world, how are you today?')).toBeLessThan(15)
})
