import { Download, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { rehydrateProfile } from '@/state/profile'
import { rehydrateStudy } from '@/state/study'
import { progress } from '@/storage'
import { backupFileName, makeBackup, parseBackup, type Backup } from '@/storage/backup'
import { Button } from '@/ui/Button'
import { ConfirmDialog } from '@/ui/Dialog'

type Pending = { kind: 'import'; backup: Backup } | { kind: 'reset' } | null

/** Backup file out, backup file in, and a full reset — all local, nothing leaves the device. */
export function BackupPanel() {
  const file = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const exportFile = async () => {
    const backup = makeBackup(await progress().exportData())
    const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = backupFileName()
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage({
      tone: 'ok',
      text: `Zapisano plik ${a.download}. Trzymaj go w bezpiecznym miejscu.`,
    })
  }

  const pickFile = async (f: File | undefined) => {
    if (!f) return
    const r = parseBackup(await f.text())
    if (file.current) file.current.value = ''
    if (!r.ok) setMessage({ tone: 'error', text: r.error })
    else setPending({ kind: 'import', backup: r.backup })
  }

  const confirm = async () => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'import') {
        await progress().importData(pending.backup.data, 'replace')
        setMessage({
          tone: 'ok',
          text: `Wczytano kopię z ${new Date(pending.backup.exportedAt).toLocaleDateString('pl-PL')}: ${pending.backup.data.attempts.length} odpowiedzi.`,
        })
      } else {
        await progress().clearAll()
        setMessage({ tone: 'ok', text: 'Wszystkie postępy zostały usunięte z tego urządzenia.' })
      }
      await Promise.all([rehydrateStudy(), rehydrateProfile()])
    } catch {
      setMessage({ tone: 'error', text: 'Nie udało się zapisać danych. Spróbuj jeszcze raz.' })
    } finally {
      setBusy(false)
      setPending(null)
    }
  }

  return (
    <div>
      <p className="text-ink-2">
        Postępy są zapisane tylko w tej przeglądarce. Zrób kopię, zanim wyczyścisz dane przeglądarki
        albo zmienisz telefon.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button
          variant="primary"
          block
          icon={<Download aria-hidden className="size-5" />}
          onClick={() => void exportFile()}
        >
          Zapisz kopię
        </Button>
        <Button
          variant="secondary"
          block
          icon={<Upload aria-hidden className="size-5" />}
          onClick={() => file.current?.click()}
        >
          Wczytaj kopię
        </Button>
      </div>
      <input
        ref={file}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void pickFile(e.target.files?.[0])}
      />
      {message && (
        <p
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={
            message.tone === 'error'
              ? 'mt-3 text-small font-bold text-wrong-text'
              : 'mt-3 text-small font-bold text-correct-text'
          }
        >
          {message.text}
        </p>
      )}
      <Button
        variant="ghost"
        className="mt-4 -ml-3"
        icon={<Trash2 aria-hidden className="size-5" />}
        onClick={() => setPending({ kind: 'reset' })}
      >
        Usuń wszystkie postępy
      </Button>

      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'reset' ? 'Usunąć wszystkie postępy?' : 'Wczytać tę kopię?'}
        confirmLabel={pending?.kind === 'reset' ? 'Tak, usuń' : 'Wczytaj i zastąp'}
        onConfirm={() => void confirm()}
        onCancel={() => setPending(null)}
        busy={busy}
      >
        {pending?.kind === 'reset' ? (
          <p>
            Odpowiedzi, sesje, zakładki i wybrane przedmioty znikną z tego urządzenia. Tej operacji
            nie da się cofnąć bez kopii.
          </p>
        ) : pending?.kind === 'import' ? (
          <p>
            Kopia z {new Date(pending.backup.exportedAt).toLocaleString('pl-PL')} (
            {pending.backup.data.attempts.length} odpowiedzi) zastąpi obecne postępy na tym
            urządzeniu.
          </p>
        ) : null}
      </ConfirmDialog>
    </div>
  )
}
