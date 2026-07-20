import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

function Page({ name }: { name: string }) {
  const navigate = useNavigate()
  return (
    <>
      <h1>{name}</h1>
      <Link to={name === 'First' ? '/second' : '/first'}>Next page</Link>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  )
}

test('scrolls new pages to the top but leaves back navigation to browser restoration', async () => {
  const user = userEvent.setup()
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  render(
    <MemoryRouter initialEntries={['/first']}>
      <ScrollToTop />
      <Routes>
        <Route path="/first" element={<Page name="First" />} />
        <Route path="/second" element={<Page name="Second" />} />
      </Routes>
    </MemoryRouter>,
  )

  expect(scrollTo).not.toHaveBeenCalled()
  await user.click(screen.getByRole('link', { name: 'Next page' }))
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' })

  scrollTo.mockClear()
  await user.click(screen.getByRole('button', { name: 'Back' }))
  expect(await screen.findByRole('heading', { name: 'First' })).toBeInTheDocument()
  expect(scrollTo).not.toHaveBeenCalled()
})
