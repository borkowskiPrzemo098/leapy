import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnswerOption } from './AnswerOption'
import { Button } from './Button'
import { Switch } from './controls'
import { GoalRing, ProgressBar, StepLadder } from './progress'

describe('AnswerOption', () => {
  it('announces correct and wrong states without relying on colour', () => {
    const { rerender } = render(
      <AnswerOption keyLabel="1" state="correct">
        4
      </AnswerOption>,
    )
    expect(screen.getByText('Poprawna odpowiedź')).toBeInTheDocument()
    rerender(
      <AnswerOption keyLabel="1" state="wrong">
        4
      </AnswerOption>,
    )
    expect(screen.getByText('Błędna odpowiedź')).toBeInTheDocument()
  })

  it('calls onSelect when tapped', async () => {
    const onSelect = vi.fn()
    render(
      <AnswerOption keyLabel="A" onSelect={onSelect}>
        8
      </AnswerOption>,
    )
    await userEvent.click(screen.getByRole('button', { name: /8/ }))
    expect(onSelect).toHaveBeenCalledOnce()
  })
})

describe('progress', () => {
  it('exposes values to assistive tech and clamps overflow', () => {
    render(
      <>
        <ProgressBar value={3} max={10} label="Sesja" />
        <GoalRing value={14} goal={10} label="Cel" />
        <StepLadder steps={5} done={2} label="Poziom" />
      </>,
    )
    expect(screen.getByRole('progressbar', { name: 'Sesja' })).toHaveAttribute('aria-valuenow', '3')
    expect(screen.getByRole('progressbar', { name: 'Cel' })).toHaveAttribute('aria-valuenow', '10')
    expect(screen.getByRole('progressbar', { name: 'Poziom' })).toHaveAttribute(
      'aria-valuemax',
      '5',
    )
  })
})

describe('controls', () => {
  it('switch toggles aria-checked through onChange', async () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onChange={onChange} label="Animacje" />)
    const sw = screen.getByRole('switch', { name: /Animacje/ })
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('loading button is busy and disabled', () => {
    render(<Button loading>Zapisz</Button>)
    const b = screen.getByRole('button', { name: 'Zapisz' })
    expect(b).toBeDisabled()
    expect(b).toHaveAttribute('aria-busy', 'true')
  })
})
