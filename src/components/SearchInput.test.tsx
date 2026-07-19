import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders with placeholder text', () => {
    render(<SearchInput value="" onChange={() => {}} />)
    expect(screen.getByPlaceholderText('Search models...')).toBeInTheDocument()
  })

  it('displays the current value', () => {
    render(<SearchInput value="claude" onChange={() => {}} />)
    const input = screen.getByDisplayValue('claude')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchInput value="" onChange={onChange} />)

    const input = screen.getByPlaceholderText('Search models...')
    await user.type(input, 'gpt')

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls.length).toBe(3)
  })

  it('shows clear button when value is present', () => {
    render(<SearchInput value="claude" onChange={() => {}} />)
    const clearButton = screen.getByLabelText('Clear search')
    expect(clearButton).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={() => {}} />)
    const clearButton = screen.queryByLabelText('Clear search')
    expect(clearButton).not.toBeInTheDocument()
  })

  it('clears the search when clear button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchInput value="claude" onChange={onChange} />)

    const clearButton = screen.getByLabelText('Clear search')
    await user.click(clearButton)

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('accepts custom placeholder', () => {
    render(<SearchInput value="" onChange={() => {}} placeholder="Find a model..." />)
    expect(screen.getByPlaceholderText('Find a model...')).toBeInTheDocument()
  })
})
