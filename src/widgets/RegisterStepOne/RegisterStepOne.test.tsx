import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegisterStepOne } from './RegisterStepOne'

afterEach(cleanup)
describe('черновик первого шага', () => {
  it('восстанавливает email и пароль и передаёт их при продолжении', () => {
    const onNext = vi.fn()
    render(
      <RegisterStepOne
        initialData={{ email: 'test@example.org', password: 'Password123' }}
        onNext={onNext}
      />,
    )
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('test@example.org')
    expect((screen.getByLabelText('Пароль') as HTMLInputElement).value).toBe('Password123')
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }))
    expect(onNext).toHaveBeenCalledWith({ email: 'test@example.org', password: 'Password123' })
  })
  it('передаёт незавершённый ввод в черновик до валидации и нажатия Далее', () => {
    const onDraftChange = vi.fn()
    const onNext = vi.fn()
    render(<RegisterStepOne onNext={onNext} onDraftChange={onDraftChange} />)
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'незавершённый-email' } })
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: '123' } })
    expect(onDraftChange).toHaveBeenLastCalledWith({
      email: 'незавершённый-email',
      password: '123',
    })
    expect(onNext).not.toHaveBeenCalled()
  })
})
