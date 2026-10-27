import type { MockState } from '@/engine/mock'
import { progress } from '@/storage'

// The running mock exam lives in kv so it survives closing the app (the clock keeps running,
// as on a real exam). The last finished one stays readable for its result screen.

const ACTIVE = 'mock:active'
const LAST = 'mock:last'

export const activeMock = () => progress().getKv<MockState>(ACTIVE)
export const saveActiveMock = (s: MockState) => progress().setKv(ACTIVE, s)
export const dropActiveMock = () => progress().deleteKv(ACTIVE)

export const lastMock = () => progress().getKv<MockState>(LAST)
export async function archiveMock(s: MockState) {
  await progress().setKv(LAST, s)
  await dropActiveMock()
}

export const mockPath = (exam: string, subject: string) => `/app/sesja/probny/${exam}/${subject}`
