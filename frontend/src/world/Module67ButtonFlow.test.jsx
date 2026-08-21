import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PointerDragChoice } from './PointerDragChoice.jsx'

describe('Module 6 and 7 answer buttons', () => {
  it('submits a normal click without drag or pointer capture', () => {
    const onPick = vi.fn()
    render(<PointerDragChoice step={{ choices: [{ label: 'First' }, { label: 'Second' }] }} onPick={onPick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    expect(onPick).toHaveBeenCalledWith(1)
  })
})
