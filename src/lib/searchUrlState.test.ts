import { parseSearchParams, serializeSearchParams } from './searchUrlState.ts'

test('empty params parse to the default state', () => {
  expect(parseSearchParams(new URLSearchParams())).toEqual({ query: '' })
})

test('default state serializes to an empty query string', () => {
  const params = serializeSearchParams(parseSearchParams(new URLSearchParams()))
  expect(params.toString()).toBe('')
})

test('a query round-trips through the URL', () => {
  const state = { query: 'claude' }
  expect(parseSearchParams(serializeSearchParams(state))).toEqual(state)
})

test('queries with spaces and symbols survive the round trip', () => {
  const state = { query: 'gpt 5.6 & friends' }
  const params = serializeSearchParams(state)
  expect(parseSearchParams(params)).toEqual(state)
})

test('an empty query is omitted from the params', () => {
  expect(serializeSearchParams({ query: '' }).has('q')).toBe(false)
})

test('unrelated and duplicate params degrade gracefully', () => {
  expect(parseSearchParams(new URLSearchParams('view=cards&sort=vibes'))).toEqual({ query: '' })
  // URLSearchParams.get returns the first value; a repeated q is not an error.
  expect(parseSearchParams(new URLSearchParams('q=claude&q=gemini'))).toEqual({ query: 'claude' })
})
