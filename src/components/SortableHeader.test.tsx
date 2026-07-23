import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortableHeader } from './SortableHeader'
import type { SortConfig } from '../lib/sort'

const unsorted: SortConfig = { column: null, direction: 'asc' }

function renderHeader(props: Partial<Parameters<typeof SortableHeader>[0]> = {}) {
  const onSort = vi.fn()
  render(
    <table>
      <thead>
        <tr>
          <SortableHeader
            column="gpqa-diamond"
            label="GPQA"
            sort={unsorted}
            onSort={onSort}
            {...props}
          />
        </tr>
      </thead>
    </table>,
  )
  return { onSort }
}

describe('SortableHeader', () => {
  it('marks the column header as unsorted by default', () => {
    renderHeader()
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none')
  })

  it('reflects the active sort direction with aria-sort', () => {
    renderHeader({ sort: { column: 'gpqa-diamond', direction: 'desc' } })
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'descending')
  })

  it('leaves aria-sort at none when another column is sorted', () => {
    renderHeader({ sort: { column: 'name', direction: 'asc' } })
    expect(screen.getByRole('columnheader')).toHaveAttribute('aria-sort', 'none')
  })

  it('always shows both sort arrows so the column reads as sortable', () => {
    renderHeader()
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('▲')
    expect(button).toHaveTextContent('▼')
  })

  it('announces the direction the next click will apply', () => {
    renderHeader({ sort: { column: 'gpqa-diamond', direction: 'asc' } })
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain('Sort descending')
  })

  it('moves the long explanation into a tooltip rather than the label', () => {
    renderHeader({ title: 'PhD-level science questions.' })
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'GPQA: PhD-level science questions.')
    expect(button.getAttribute('aria-label')).toContain('PhD-level science questions.')
  })

  it('keeps the header on a single line', () => {
    renderHeader({ title: 'A long explanation that used to wrap the header.' })
    expect(screen.getByRole('columnheader')).toHaveClass('whitespace-nowrap')
  })

  it('calls onSort with the column when clicked', async () => {
    const user = userEvent.setup()
    const { onSort } = renderHeader()

    await user.click(screen.getByRole('button'))
    expect(onSort).toHaveBeenCalledWith('gpqa-diamond')
  })

  it('sorts from the keyboard', async () => {
    const user = userEvent.setup()
    const { onSort } = renderHeader()

    await user.tab()
    await user.keyboard('{Enter}')
    expect(onSort).toHaveBeenCalledWith('gpqa-diamond')
  })

  it('renders trailing content outside the sort button so it stays focusable', async () => {
    const user = userEvent.setup()
    const { onSort } = renderHeader({
      trailing: <a href="https://example.com">source</a>,
    })

    const link = screen.getByRole('link', { name: 'source' })

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()
    await user.tab()
    expect(link).toHaveFocus()

    await user.click(link)
    expect(onSort).not.toHaveBeenCalled()
  })
})
