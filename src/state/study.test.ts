import { useStudy } from './study'

describe('study selection', () => {
  beforeEach(() => useStudy.getState().reset())

  it('toggles subjects within one exam', () => {
    const s = useStudy.getState()
    s.toggleSubject('matura', 'matematyka-p')
    s.toggleSubject('matura', 'polski-p')
    s.toggleSubject('matura', 'matematyka-p')
    expect(useStudy.getState()).toMatchObject({ exam: 'matura', subjects: ['polski-p'] })
  })

  it('switching exam drops subjects from the previous one', () => {
    useStudy.getState().toggleSubject('matura', 'polski-p')
    useStudy.getState().chooseExam('e8')
    expect(useStudy.getState()).toMatchObject({ exam: 'e8', subjects: [] })
    useStudy.getState().toggleSubject('e8', 'matematyka')
    useStudy.getState().chooseExam('e8')
    expect(useStudy.getState().subjects).toEqual(['matematyka'])
  })
})
