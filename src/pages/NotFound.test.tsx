import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { NotFound } from './NotFound'

test('renders the 404 page', () => {
  render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>,
  )
  expect(screen.getByText('Page not found')).toBeInTheDocument()
})

test('displays all main page links', () => {
  render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>,
  )

  // Check for all the main page links
  expect(screen.getByText(/Home/)).toBeInTheDocument()
  expect(screen.getByText(/Which model should I use/)).toBeInTheDocument()
  expect(screen.getByText(/Compare models/)).toBeInTheDocument()
  expect(screen.getByText(/See it on a graph/)).toBeInTheDocument()
  expect(screen.getByText(/Token calculator/)).toBeInTheDocument()
  expect(screen.getByText(/Learn the basics/)).toBeInTheDocument()
})

test('all links have correct href attributes', () => {
  render(
    <BrowserRouter>
      <NotFound />
    </BrowserRouter>,
  )

  // Check link destinations
  const homeLink = screen.getByRole('link', { name: /Home/ })
  const quizLink = screen.getByRole('link', { name: /Which model should I use/ })
  const compareLink = screen.getByRole('link', { name: /Compare models/ })
  const graphLink = screen.getByRole('link', { name: /See it on a graph/ })
  const calculatorLink = screen.getByRole('link', { name: /Token calculator/ })
  const learnLink = screen.getByRole('link', { name: /Learn the basics/ })

  expect(homeLink).toHaveAttribute('href', '/')
  expect(quizLink).toHaveAttribute('href', '/quiz')
  expect(compareLink).toHaveAttribute('href', '/compare')
  expect(graphLink).toHaveAttribute('href', '/graph')
  expect(calculatorLink).toHaveAttribute('href', '/calculator')
  expect(learnLink).toHaveAttribute('href', '/learn')
})
