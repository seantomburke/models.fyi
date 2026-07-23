import { defaultViewMode, loadViewMode, saveViewMode, MOBILE_BREAKPOINT } from './viewMode.ts'

beforeEach(() => {
  localStorage.clear()
})

test('defaults to cards below the mobile breakpoint', () => {
  expect(defaultViewMode(MOBILE_BREAKPOINT - 1)).toBe('cards')
  expect(defaultViewMode(375)).toBe('cards')
})

test('defaults to table at and above the mobile breakpoint', () => {
  expect(defaultViewMode(MOBILE_BREAKPOINT)).toBe('table')
  expect(defaultViewMode(1440)).toBe('table')
})

test('load falls back to the viewport default when nothing is stored', () => {
  expect(loadViewMode(1024)).toBe('table')
  expect(loadViewMode(375)).toBe('cards')
})

test('saved preference wins over the viewport default', () => {
  saveViewMode('cards')
  expect(loadViewMode(1024)).toBe('cards')
  saveViewMode('table')
  expect(loadViewMode(375)).toBe('table')
})

test('load ignores corrupt stored values', () => {
  localStorage.setItem('models-wtf-view-mode', 'sideways')
  expect(loadViewMode(1024)).toBe('table')
})
