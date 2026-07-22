import { fireEvent, render, screen } from '@testing-library/react'
import { TrainingLab } from './TrainingLab'

describe('TrainingLab', () => {
  it('requires every drawing to be labelled before training', () => {
    render(<TrainingLab />)
    expect(screen.getByRole('button', { name: 'Start training' })).toBeDisabled()
    expect(screen.getByText('0 of 50 labelled')).toBeInTheDocument()
  })

  it('uses the seeded drawings and labels them into accessible buckets', () => {
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))
    expect(screen.getByText('50 of 50 labelled')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start training' })).toBeEnabled()
    expect(screen.getByRole('list', { name: 'E bucket' }).children).toHaveLength(25)
    expect(screen.getByRole('list', { name: '3 bucket' }).children).toHaveLength(25)
  })

  it('trains the assigned labels and classifies a fresh drawing with the learned weights', () => {
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Label all correctly' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start training' }))
    expect(screen.getByText(/Epoch 0 of 120/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Learned 64-pixel weight heatmap' }).children).toHaveLength(64)
    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(screen.getByText(/Prediction: 3/)).toBeInTheDocument()
  })

  it('learns the inverted rule when every bucket label is reversed', () => {
    render(<TrainingLab />)
    fireEvent.click(screen.getByRole('button', { name: 'Invert every label' }))
    fireEvent.click(screen.getByRole('button', { name: 'Start training' }))
    fireEvent.click(screen.getByRole('button', { name: 'Example: 3' }))
    expect(screen.getByText(/Prediction: E/)).toBeInTheDocument()
  })
})
