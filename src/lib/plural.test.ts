import { describe, expect, it } from 'vitest'
import { plural, tasksLabel } from './plural'

describe('plural', () => {
  it('picks one, few and many like Polish does', () => {
    expect([1, 2, 4, 5, 12, 14, 21, 22, 112, 162, 213].map(tasksLabel)).toEqual([
      '1 zadanie',
      '2 zadania',
      '4 zadania',
      '5 zadań',
      '12 zadań',
      '14 zadań',
      '21 zadań',
      '22 zadania',
      '112 zadań',
      '162 zadania',
      '213 zadań',
    ])
    expect(plural(3, 'dział', 'działy', 'działów')).toBe('działy')
  })
})
